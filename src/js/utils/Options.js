const Store = require('./Store');

const KEY = 'options';

module.exports = class Options {
    static async create() {
        const stored = await Store.get(KEY) || {};
        const options = new Options(stored[KEY] || {});

        return options;
    }

    constructor({ reviewers, labels, assignees }) {
        this.reviewers = reviewers || [];
        this.labels = labels || [];
        this.assignees = assignees || [];
    }

    async persist() {
        await Store.set({
            [KEY]: {
                reviewers: this.reviewers,
                labels: this.labels,
                assignees: this.assignees,
            }
        });
    }

    onUpdate(cb) {
        Store.onChange((ev) => cb({ ...ev[KEY].newValue }));
    }
}