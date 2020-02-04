import arg from 'arg';
import inquirer from 'inquirer';
import {createProject} from './main'

function parseArgumentsIntoOptions(rawArgs){
    const args = arg({
        '--git': Boolean,
        '--yes': Boolean,
        '--install': Boolean,
        '-g': '--git',
        '-y': '--yes',
        '-i': '--install'
    },
    {
        argv: rawArgs.slice(2)
    },

    );
    return {
        skipPrompts: args['--yes'] || false,
        git: args['--git'] || false,
        template: args._[0],
        runInstall: args['--install'] || false
    }
}

async function promptForMissingOptions(options){
    const defaultTemplate = 'API';
    if(options.skipPrompts){
        return {
            ...options,
            template: options.template || defaultTemplate
        }
    }

    const questions = [];

    if(!options.template){
        questions.push({
            type: 'list',
            name: 'template',
            message: 'Por favor selecione o template de projeto que deseja utilizar:',
            choices: ['API'],
            default: defaultTemplate
        })
    }

    if(!options.git){
        questions.push({
            type: 'confirm',
            name: 'git',
            message: 'Inicializar repósitorio do git?',
            default: false
        })
    }

    if(!options.runInstall){
        questions.push({
            type: 'confirm',
            name: 'runInstall',
            message: 'Deseja instalar as dependências dos projetos?',
            default: false
        })
    }

    const answers = await inquirer.prompt(questions)
    return {
        ...options,
        template: options.template || answers.template,
        git: options.git || answers.git,
        runInstall: options.runInstall || answers.runInstall,
    }
}

export async function cli(args) {
    let options = parseArgumentsIntoOptions(args)
    options = await promptForMissingOptions(options)
    await createProject(options);
}