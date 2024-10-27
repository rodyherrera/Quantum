import { removeNetworks, filterAvailableNetworks } from '@cli/utilities/docker';
import prompts from 'prompts';

export const removeCreatedNetworks = async (): Promise<void> => {
    const networks = await filterAvailableNetworks();
    if(!networks.length){
        console.log('There are no networks created.');
        return;
    }
    const { environment } = await prompts({
        type: 'select',
        name: 'environment',
        message: 'What networks do you want to delete?',
        choices: [
            { title: 'All those that have been created in production.', value: 'production' },
            { title: 'Those created in development.', value: 'development' },
        ]
    });
    const environmentNetworks = networks
        .filter(({ Name }) => Name.startsWith(`quantum-network-${environment}`));
    for(let i = 0; i < environmentNetworks.length; i++){
        console.log(`${i + 1}) ${environmentNetworks[i].Name}`);
    }
    console.log(`\n${environmentNetworks.length} created networks have been found.`);
    const { confirm } = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: 'This cannot be undone. Do you want to continue?'
    })
    if(confirm){
        await removeNetworks(environmentNetworks); 
        console.log('All networks were removed.');
        return;
    }
    console.log('No networks were removed.');
};

export default removeCreatedNetworks;