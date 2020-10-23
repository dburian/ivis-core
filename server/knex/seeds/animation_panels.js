"use strict";

const fs = require('fs');
const path = require('path');
const promisify = require('bluebird').promisify;
const readFileAsync = promisify(fs.readFile);

const exampleDirs = ['animation_1', 'animation_2', 'animation_3'].map(
    dirName => path.join('..', '..', 'examples', 'templates', dirName)
);
const templates = [
    {
        name: '[ANIMATION] Line and bar charts (Recorded)',
        description: 'Template presenting the use of recorded animation in combination with line chart and bar chart.',
        type: 'jsx',
        state: 1,
        namespace: 1
    },
    {
        name: '[ANIMATION] Svg graphic, line and pie charts (Recorded)',
        description: 'Template presenting the use of recorded animation in combination with line chart, pie charts and custom SVG graphic.',
        type: 'jsx',
        state: 1,
        namespace: 1
    },
    {
        name: '[ANIMATION] Svg graphic, line and bar charts (Live)',
        description: 'Template presenting the use of custom live animation in combination with line chart, bar chart and SVG graphic.',
        type: 'jsx',
        state: 1,
        namespace: 1
   }
];
const panels = [
    {
        name: 'COVID development in chosen districts',
        description: 'Comparison of COVID development in various districts in Italy.',
        order: 1,
        template: 10,
        namespace: 1
    },
    {
        name: 'COVID testing in detail',
        description: 'Comparison of testing results in various districts in Italy.',
        order: 2,
        template: 11,
        namespace: 1
    },
    {
        name: 'Live server information',
        description: 'Live server information regarding the CPU, Memory and Disk.',
        order: 3,
        template: 12,
        namespace: 1
    }
];

const paramsFN = 'params.json';
const jsxFN = 'template.js';
const stylesFN = 'styles.scss';
const panel_paramsFN = 'panel_params.json';

async function deleteOldPanels(knex) {
    await knex.transaction(async tx => {
        //Deletes templates with name prefixed with '[ANIMATION]'
        //Deletes workspace with the name 'Animation'

        await tx('templates').where('name', 'like', '[ANIMATION]%').del();

        const workspace = await tx('workspaces').where('name', 'Animation').first('id');
        if (workspace !== undefined) {
            await tx('panels').where('workspace', workspace.id).del();
            await tx('workspaces').where('id', workspace.id).del();
        }
    });
}

exports.seed = knex => (async() => {
    await deleteOldPanels(knex);

    const workspaceId = await knex('workspaces').insert({
        name: 'Animation',
        description: 'Workspace showcasing the use of animations in combination with various visualizations.',
        order: 1,
        namespace: 1
    });

    const panelIds = [];

    for (let i = 0; i < exampleDirs.length; i++) {
        const exampleDir = exampleDirs[i];

        const templateSettings = {
            params: JSON.parse(await readFileAsync(path.join(exampleDir, paramsFN), 'utf8')),
            jsx: await readFileAsync(path.join(exampleDir, jsxFN), 'utf8'),
            scss: '',
        };

        try {
            const scss = await readFileAsync(path.join(exampleDir, stylesFN), 'utf8');

            templateSettings.scss = scss;
        } catch (err) {
            if (err.code !== 'ENOENT') console.error(err);
        }

        const templateId = await knex('templates').insert({
            ...templates[i],
            settings: JSON.stringify(templateSettings),
        });

        const panelParams = JSON.parse(await readFileAsync(path.join(exampleDir, panel_paramsFN), 'utf8'));

        const panelId = await knex('panels').insert({
            ...panels[i],
            workspace: workspaceId,
            template: templateId,
            params: JSON.stringify(panelParams),
        });

        panelIds.push(panelId);
    }

    await knex('workspaces').where('id', workspaceId).update({default_panel: panelIds[0]});
})();
