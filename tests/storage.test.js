const test = require('node:test');
const assert = require('node:assert/strict');
const StorageManager = require('../js/storage.js');

function installStorage(initial = {}) {
    const values = new Map(Object.entries(initial));
    global.localStorage = {
        getItem(key) {
            return values.has(key) ? values.get(key) : null;
        },
        setItem(key, value) {
            values.set(key, String(value));
        },
        removeItem(key) {
            values.delete(key);
        }
    };
}

function validStep(overrides = {}) {
    return {
        id: 'step_1',
        category: 'Programming',
        subcategory: 'Git',
        title: 'Initialize',
        order: 1,
        description: 'Create a repository',
        tags: ['work'],
        dueDate: '2026-11-18',
        completed: false,
        ...overrides
    };
}

test('saves and reads steps', () => {
    installStorage();
    StorageManager.saveStep(validStep({ id: undefined }));
    const steps = StorageManager.getSteps();
    assert.equal(steps.length, 1);
    assert.match(steps[0].id, /^step_/);
});

test('merges imported steps by id', () => {
    installStorage({
        howto_app_steps: JSON.stringify([validStep({ title: 'Old title' })])
    });
    StorageManager.importSteps([validStep({ title: 'Updated title' })], false);
    assert.equal(StorageManager.getSteps()[0].title, 'Updated title');
});

test('rejects invalid step values', () => {
    installStorage();
    assert.throws(
        () => StorageManager.writeSteps([validStep({ order: 0 })]),
        error => error.code === 'invalidStep'
    );
});

test('reorders steps without changing their categories', () => {
    installStorage({
        howto_app_steps: JSON.stringify([
            validStep({ id: 'step_1', order: 1 }),
            validStep({ id: 'step_2', order: 2 })
        ])
    });
    const reordered = StorageManager.reorderSteps(['step_2', 'step_1']);
    assert.deepEqual(reordered.map(step => step.id), ['step_2', 'step_1']);
    assert.deepEqual(reordered.map(step => step.order), [1, 2]);
});

test('deletes only steps in the selected category and subcategory', () => {
    installStorage({
        howto_app_steps: JSON.stringify([
            validStep({ id: 'step_1', category: 'Programming', subcategory: 'Git' }),
            validStep({ id: 'step_2', category: 'Programming', subcategory: 'Testing' }),
            validStep({ id: 'step_3', category: 'Cooking', subcategory: 'Git' })
        ])
    });

    StorageManager.deleteSteps('Programming', 'Git');
    assert.deepEqual(
        StorageManager.getSteps().map(step => step.id).sort(),
        ['step_2', 'step_3']
    );
});

test('deletes all steps when no scope is selected', () => {
    installStorage({
        howto_app_steps: JSON.stringify([
            validStep({ id: 'step_1' }),
            validStep({ id: 'step_2' })
        ])
    });

    StorageManager.deleteSteps();
    assert.deepEqual(StorageManager.getSteps(), []);
});

test('creates one ordered step for each blank-line-delimited Markdown block', () => {
    const steps = StorageManager.createStepsFromMarkdown(
        '# First step\nFirst paragraph.\nSecond paragraph.\n\n- Second step\nDetails.',
        {
            category: 'Programming',
            subcategory: 'Git',
            tags: ['work', 'guide'],
            dueDate: '2026-11-18'
        },
        index => `step_${index + 1}`
    );

    assert.equal(steps.length, 2);
    assert.deepEqual(steps.map(step => step.order), [1, 2]);
    assert.deepEqual(steps.map(step => step.title), ['First step', 'Second step']);
    assert.equal(steps[0].description, 'First paragraph.\n\nSecond paragraph.');
    assert.equal(steps[1].description, 'Details.');
    assert.equal(steps[0].category, 'Programming');
    assert.equal(steps[0].subcategory, 'Git');
    assert.deepEqual(steps[0].tags, ['work', 'guide']);
    assert.equal(steps[0].dueDate, '2026-11-18');
});
