import chalk from 'chalk';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import {promisify} from 'util';
import ora from 'ora';
import exaca from 'execa';
import Listr from 'listr';
import {projectInstall} from 'pkg-install';

const access = promisify(fs.access);
const copy = promisify(ncp);

async function copyTemplateFiles(options){
    return copy(options.templateDirectory, options.targetDirectory, {
        clobber: false
    })
}

async function initGit(options){
    const result = await exaca('git', ['init'], {
        cwd: options.targetDirectory,
    });
    if(result.failed) Promise.reject(new Error('Falha na inicialização do git'));
    return;
}

export async function createProject(options){
    options = {
        ...options,
        targetDirectory: options.targetDirectory || process.cwd(),
    }

    const currentFileUrl = import.meta.url;

    const templateDir = path.resolve(
        new URL(`${currentFileUrl}`).pathname,
        '../../templates',
        options.template.toLowerCase()
    )

    options.templateDirectory = templateDir.substring(3, currentFileUrl.length);

    try{
        await access(options.templateDirectory, fs.constants.R_OK);
    } catch{
        console.error('%s Nome de template inválido', chalk.bold.red('ERRO'));
        process.exit(1)
    }

    const tasks = new Listr([
        {
            title: 'Geração de Arquivos',
            task: () => copyTemplateFiles(options)
        },
        {
            title: 'Init Git',
            task: () => initGit(options),
            enabled: () => options.git
        },
        {
            title: 'Instalação de dependências',
            task: () => projectInstall({
                cwd: options.targetDirectory
            }),
            skip: () => !options.runInstall ? 'Passe --install para a instalação automática de dependências' : undefined
        },

    ]);

    await tasks.run();
    process.exit(1)
}