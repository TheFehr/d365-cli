import * as fs from 'fs';
import * as path from 'path';
import { prompt, QuestionCollection } from 'inquirer';

interface CodeFileConfig {
    namespace: string;
}

export default async function codeFile(type: string, filename: string) {
    await write(type, filename);

    console.log();
    console.log(`added ${type} ${filename}.cs`);
    console.log();
}

async function write(type: string, filename: string) {
    let destinationPath = process.cwd();
    let templatePath = path.resolve(__dirname, 'templates');

    // Check if file already exists
    if (fs.existsSync(path.resolve(destinationPath, `${filename}.cs`))) {
        console.log(`${type} ${filename} already exists`);
        return;
    }

    filename = filename.replace('.cs', '');

    let config: CodeFileConfig;

    // Read namespace from .d365rc file
    if (fs.existsSync(path.resolve(destinationPath, '.d365rc'))) {
        config = JSON.parse(fs.readFileSync(path.resolve(destinationPath, '.d365rc'), 'utf8'));
    } else if (fs.existsSync(path.resolve(destinationPath, '..', '.d365rc'))) {
        config = JSON.parse(fs.readFileSync(path.resolve(destinationPath, '..', '.d365rc'), 'utf8'));
    } else if (fs.existsSync(path.resolve(destinationPath, '..', '..', '.d365rc'))) {
        config = JSON.parse(fs.readFileSync(path.resolve(destinationPath, '..', '..', '.d365rc'), 'utf8'));
    } else {
      config = await getConfig();
      fs.writeFileSync(path.resolve(destinationPath, '.d365rc'), JSON.stringify({ namespace: config.namespace }));
    }

    let content: string = fs.readFileSync(path.resolve(templatePath, `${type}.cs`), 'utf8');
    let namespace = config != null ? config.namespace : 'Xrm';
    
    content = content.replace('<%= namespace %>', namespace);
    content = content.replace('<%= name %>', filename);

    fs.writeFileSync(path.resolve(destinationPath, `${filename}.cs`), content);
}

function getConfig(): Promise<CodeFileConfig> {
  console.log();

  const questions: QuestionCollection<CodeFileConfig> = [
      {
          type: 'input',
          name: 'namespace',
          message: 'default namespace',
          default: path.basename(process.cwd())
      }
  ];

  return prompt(questions);
}
