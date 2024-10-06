import { removeContainers, filterAvailableContainers } from '@cli/utilities/docker';
import prompts from 'prompts';

export const removeCreatedContainers = async (): Promise<void> => {
    const containers = await filterAvailableContainers();
    if(!containers.length){
        console.log('There are no containers created.');
        return;
    }
    const { environment } = await prompts({
        type: 'select',
        name: 'environment',
        message: 'What containers do you want to delete?',
        choices: [
            { title: 'All those that have been created in production.', value: 'production' },
            { title: 'Those created in development.', value: 'development' },
        ]
    });
    const environmentContainers = containers
        .filter(({ Names }) => Names[0].startsWith(`/quantum-container-${environment}`));
    for(let i = 0; i < environmentContainers.length; i++){
        console.log(`${i + 1}) ${environmentContainers[i].Names[0]}`);
    }
    console.log(`\n${environmentContainers.length} containers have been found.`);
    const { confirm } = await prompts({
        type: 'confirm',
        name: 'confirm',
        message: 'This cannot be undone. Do you want to continue?'
    })
    if(confirm){
        await removeContainers(environmentContainers); 
        console.log('All containers were removed.');
        return;
    }
    console.log('No containers were removed.');
};

export default removeCreatedContainers;