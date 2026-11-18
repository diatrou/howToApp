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
