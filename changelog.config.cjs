const types = {
    hotfix: {
        description: 'Hotfix',
        emoji: '🚑️',
        value: 'hotfix',
    },
    feat: {
        description: 'A new feature',
        emoji: '✨',
        value: 'feat',
    },
    fix: {
        description: 'A bug fix',
        emoji: '🐛',
        value: 'fix',
    },
    breaking: {
        description: 'Breaking changes (possibly hanging)',
        emoji: '💥',
        value: 'breaking',
    },
    perf: {
        description: 'A code change that improves performance',
        emoji: '⚡️',
        value: 'perf',
    },
    refactor: {
        description: 'A code change that neither fixes a bug or adds a feature',
        emoji: '🚚',
        value: 'refactor',
    },
    cleanup: {
        description: 'Cleaning up code/repository',
        emoji: '🔥',
        value: 'cleanup',
    },
    docs: {
        description: 'Documentation only changes',
        emoji: '✏️ ',
        value: 'docs',
    },
    test: {
        description: 'Adding/updating tests',
        emoji: '❎',
        value: 'test',
    },
    formatting: {
        description: 'Formatting',
        emoji: '📝',
        value: 'formatting',
    },
    dev: {
        description: 'Development related changes',
        emoji: '🧰',
        value: 'dev',
    },
    build: {
        description: 'Build related changes',
        emoji: '🧰',
        value: 'build',
    },
    ci: {
        description: 'CI related changes',
        emoji: '🎡',
        value: 'ci',
    },
    repository: {
        description: 'Repository related changes',
        emoji: '📦',
        value: 'repository',
    },
    package: {
        description: 'Package related changes',
        emoji: '📦',
        value: 'package',
    },
    dependencies: {
        description: 'Dependencies related changes',
        emoji: '📦',
        value: 'dependencies',
    },
    release: {
        description: 'Create a release commit',
        emoji: '🏹',
        value: 'release',
    },
    tools: {
        description: 'Tools and scripts',
        emoji: '🛠️ ',
        value: 'tools',
    },
    chore: {
        description: 'Build process or auxiliary tool changes',
        emoji: '🤖',
        value: 'chore',
    },
}

module.exports = {
    disableEmoji: false,
    format: '{emoji} {type}{scope}: {subject}',
    list: Object.keys(types),
    maxMessageLength: 80,
    minMessageLength: 3,
    questions: ['type', 'subject', 'body', 'breaking', 'issues'],
    types,
    messages: {
        type: "Select the type of change that you're committing:",
        customScope: 'Select the scope this component affects:',
        subject: 'Write a short, imperative mood description of the change:\n',
        body: 'Provide a longer description of the change:\n ',
        breaking: 'List any breaking changes:\n',
        footer: 'Issues this commit closes, e.g #123:',
        confirmCommit: 'The packages that this commit has affected\n',
    },
}
