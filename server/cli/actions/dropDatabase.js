const prompts = require('prompts');
const mongoose = require('mongoose');
const fs = require('fs');

const dropDatabase = async () => {
    const { confirm } = await prompts({
        type: 'confirm', 
        name: 'confirm', 
        message: 'Are you sure you want to perform this action? You will not be able to redo',
        initial: true
    });
    if(!confirm){
        console.log('[Quantum Manager]: Perfect, no action will be executed.')
        return;
    }
    await mongoose.connection.dropDatabase();
    console.log('[Quantum Manager]: The database has been deleted successfully.');
    console.log('[Quantum Manager]: Tried to delete the "./storage/" directory that contains .logs files and downloaded repositories...');
    fs.rm('./storage/', { recursive: true }, () => console.log('[Quantum Manager]: Directory "./storage/" successfully deleted. The database has been cleaned and the debris within the file system as well. Your instance is clean.'));
};

module.exports = dropDatabase;