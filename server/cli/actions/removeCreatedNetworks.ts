import { removeNetworks, filterAvailableNetworks } from '@cli/utilities/docker';
import prompts from 'prompts';

export const removeCreatedNetworks = async (): Promise<void> => {
    const networks = await filterAvailableNetworks();
    if(!networks.length){
        console.log('There are no networks created.');
        return;
    }
    for(let i = 0; i < networks.length; i++){
        console.log(`${i + 1}) ${networks[i].Name}`);
    }
    console.log(`\n${networks.length} created networks have been found.`);
    const { confirm } = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: 'This cannot be undone. Do you want to continue?'
    })
    if(confirm){
        await removeNetworks(networks); 
        console.log('All networks were removed.');
        return;
    }
    console.log('No networks were removed.');
};

export default removeCreatedNetworks;