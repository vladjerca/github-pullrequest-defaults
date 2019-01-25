const Options = require('./utils/Options');
const { GithubPageObserver } = require('./utils/Github');

(async () => {
    const options = await Options.create();
    const observer = new GithubPageObserver(options);

    options.onUpdate((opts) => observer.update(opts));
})(); 