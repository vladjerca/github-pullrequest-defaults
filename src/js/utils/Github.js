const INTERVAL = 150;
const TIMEOUT = 5000;

class GithubDropdown {
    constructor(sidebar, name) {
        const dropdowns = Array(...sidebar.element.querySelectorAll('.discussion-sidebar-toggle'));
        const targetEl = dropdowns.find(el => el.innerText.trim() === name);

        this.elements = {
            dropdown: targetEl,
            list: targetEl.nextElementSibling,
        };
    }

    open() {
        const isOpen = this.elements.list.classList.contains('js-active-navigation-container');

        if (isOpen) { return; }

        this.elements.dropdown.click();
    }

    close() {
        const isOpen = this.elements.list.classList.contains('js-active-navigation-container');

        if (!isOpen) { return; }

        this.elements.dropdown.click();
    }

    selectValue(value) {
        const input = this.elements.list.querySelector('input');

        input.value = value;
        input.dispatchEvent(new Event('input'));

        return new Promise((res) => {
            let attempts = 0;
            const intervalId = setInterval(() => {
                let item = this.elements.list.querySelector('.navigation-focus');
                if (item.innerText.trim() === 'Clear assignees') {
                    item = this.elements.list.querySelector('.select-menu-item.last-visible:not(button)');
                }
                const isTimedOut = ++attempts * INTERVAL >= TIMEOUT &&
                    !!this.elements.list.querySelector('.select-menu-no-results');
                const isNotFound = !item ||
                    !item.innerText.trim().startsWith(value);
                const resolve = () => {
                    clearInterval(intervalId);
                    res();
                };

                if (isTimedOut) { return resolve(); }

                if (isNotFound) { return; }

                if (item.classList.contains('selected')) { return resolve(); }

                item.click();
                setTimeout(() => res(), INTERVAL);
            }, INTERVAL);
        });
    }
}

class GithubSidebar {
    constructor(sidebar) {
        this.isFound = !!sidebar;
        this.element = sidebar;
    }

    async select(key, values) {
        const dropdown = new GithubDropdown(this, key);

        dropdown.open();
        for (const value of values) {
            await dropdown.selectValue(value);
        }
        dropdown.close();
    }
}

export class GithubPageObserver {
    constructor(options) {
        this.options = options;

        this.observer = new MutationObserver(async () => {
            const sidebar = new GithubSidebar(document.querySelector('.discussion-sidebar'));

            if (!sidebar.isFound) { return; }

            this.feature = FeatureInjector.create(sidebar.element);

            this.feature.onClick(async () => {
                await sidebar.select('Reviewers', this.options.reviewers);
                await sidebar.select('Labels', this.options.labels);
                await sidebar.select('Assignees', this.options.assignees);
            })
        });

        this.observer.observe(document.body, {
            attributes: false,
            childList: true,
            subtree: false,
        });
    }

    destroy() {
        this.observer.disconnect();
        this.feature.destroy();
    }

    update(options) {
        this.options = options;
    }
}

let FeatureInstance;
class FeatureInjector {
    static create(sidebar) {
        if (FeatureInstance) {
            FeatureInstance.destroy();
        }
        const feature = new FeatureInjector(sidebar);

        if (feature.isActivated) {
            FeatureInstance = feature;
        }

        return FeatureInstance;
    }
    constructor(sidebar) {
        if (sidebar.querySelector('.populate-default-pr-options')) { return; }

        this.isActivated = true;
        this.btn = document.createElement('div');
        this.btn.classList.add('btn', 'btn-sm', 'populate-default-pr-options');
        this.btn.innerHTML = 'Populate';
        this.btn.style.width = '100%';

        sidebar.prepend(this.btn);
    }

    onClick(hndl) {
        this.btn.onclick = hndl;
    }

    destroy() {
        if (this.btn) { this.btn.remove(); }
    }
}