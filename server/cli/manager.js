require('../aliases');
const prompts = require('prompts');
const mongoConnector = require('@utilities/mongoConnector');
const actions = require('@cli/actions');

(async () => {
    await mongoConnector();
    const { callback } = await prompts({
        type: 'select',
        name: 'callback',
        message: 'Select an option to continue...',
        choices: [
            { title: 'Create a new quantum user.', value: actions.createUser },
            { title: 'Delete the database and local waste from the system.', value: actions.dropDatabase }
        ]
    });
    await callback?.();
})();