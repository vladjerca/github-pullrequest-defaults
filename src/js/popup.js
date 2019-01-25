import '../../node_modules/@yaireo/tagify/dist/tagify.css';

import Options from './utils/Options';
import Tagify from '@yaireo/tagify';

document.querySelector('form').onsubmit = async (ev) => {
    ev.preventDefault();
    
    const formData = Array(...document.querySelectorAll('input'))
        .reduce((obj, curr) => {
            obj[curr.name] =
                (!!curr.value ? JSON.parse(curr.value) : [])
                    .map(entity => entity.value);
            return obj;
        }, {});

    const options = new Options(formData);
    await options.persist();
};

(async () => {
    const options = await Options.create();

    Object.keys(options)
        .forEach(key => {
            const input = new Tagify(document.querySelector(`input[name=${key}]`));
            input.addTags(options[key]);
        })
})();