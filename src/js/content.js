const Options = require('./utils/Options');

(async () => {
    const result = await Options.create();

    console.log(result);
})();