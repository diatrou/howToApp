// Local storage data management
const StorageManager = {
    STORAGE_KEY: 'howto_app_steps',

    getSteps() {
        let data;
        try {
            data = localStorage.getItem(this.STORAGE_KEY);
        } catch (error) {
            throw this.createStorageError('read', error);
        }

        if (data === null) return [];

        let steps;
        try {
            steps = JSON.parse(data);
        } catch (error) {
            const invalidDataError = new Error('Saved data is not valid JSON. Import a backup to recover your steps.');
            invalidDataError.code = 'corruptData';
            invalidDataError.cause = error;
            throw invalidDataError;
        }

        if (!Array.isArray(steps) ||
            !steps.every(this.isValidStep) ||
            new Set(steps.map(step => step.id)).size !== steps.length) {
            const error = new Error('Saved data has an invalid format. Import a valid backup to recover your steps.');
            error.code = 'corruptData';
            throw error;
        }
        return steps;
    },

    saveStep(stepData) {
        const steps = this.getSteps();
        const newStep = {
            ...stepData,
            id: `step_${Date.now()}_${Math.random().toString(36).slice(2)}`
        };
        steps.push(newStep);
        return this.writeSteps(steps);
    },

    updateStep(stepId, stepData) {
        const steps = this.getSteps();
        const stepIndex = steps.findIndex(step => step.id === stepId);

        if (stepIndex === -1) {
            const error = new Error('The step to update could not be found.');
            error.code = 'stepNotFound';
            throw error;
        }

        steps[stepIndex] = { ...steps[stepIndex], ...stepData, id: stepId };
        return this.writeSteps(steps);
    },

    importSteps(importedSteps, replaceExisting) {
        const existingSteps = replaceExisting ? [] : this.getSteps();
        const stepsById = new Map(existingSteps.map(step => [step.id, step]));
        importedSteps.forEach(step => stepsById.set(step.id, step));
        return this.writeSteps([...stepsById.values()]);
    },

    deleteStep(stepId) {
        const steps = this.getSteps().filter(step => step.id !== stepId);
        return this.writeSteps(steps);
    },

    deleteSteps(category = '', subcategory = '') {
        const steps = this.getSteps();
        const remainingSteps = steps.filter(step =>
            (category && step.category !== category) ||
            (subcategory && step.subcategory !== subcategory)
        );
        return this.writeSteps(remainingSteps);
    },

    createStepsFromMarkdown(markdown, common, createId) {
        if (typeof markdown !== 'string') {
            throw new Error('Markdown content must be text.');
        }
        const commonValues = common || {};
        const blocks = markdown.replace(/\r\n?/g, '\n')
            .split(/\n\s*\n+/)
            .map(block => block.split('\n').map(line => line.trim()).filter(Boolean))
            .filter(lines => lines.length);

        return blocks.map((lines, index) => {
            const title = lines[0]
                .replace(/^#{1,6}\s*/, '')
                .replace(/^(?:[-+*]|\d+[.)])\s+/, '')
                .trim();
            const description = lines.length > 1
                ? lines.slice(1).join('\n\n')
                : lines[0];
            return {
                id: createId ? createId(index) : `step_${Date.now()}_${index}_${Math.random().toString(36).slice(2)}`,
                category: String(commonValues.category || '').trim(),
                subcategory: String(commonValues.subcategory || '').trim(),
                title,
                order: index + 1,
                description,
                tags: Array.isArray(commonValues.tags)
                    ? [...commonValues.tags]
                    : [],
                dueDate: String(commonValues.dueDate || ''),
                image: '',
                completed: false
            };
        });
    },

    reorderSteps(stepIds) {
        const steps = this.getSteps();
        const stepById = new Map(steps.map(step => [step.id, step]));
        const reordered = stepIds
            .map((id, index) => {
                const step = stepById.get(id);
                return step ? { ...step, order: index + 1 } : null;
            })
            .filter(Boolean);
        return this.writeSteps([
            ...reordered,
            ...steps.filter(step => !stepIds.includes(step.id))
        ]);
    },

    writeSteps(steps) {
        if (!Array.isArray(steps) || !steps.every(this.isValidStep)) {
            const error = new Error('A step contains invalid data and was not saved.');
            error.code = 'invalidStep';
            throw error;
        }
        const sortedSteps = [...steps].sort((a, b) =>
            a.category.localeCompare(b.category) ||
            (a.subcategory || '').localeCompare(b.subcategory || '') ||
            Number(a.order) - Number(b.order)
        );
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sortedSteps));
        } catch (error) {
            throw this.createStorageError('write', error);
        }
        return sortedSteps;
    },

    isValidStep(step) {
        return step &&
            typeof step.id === 'string' && step.id &&
            typeof step.category === 'string' && step.category.trim() &&
            typeof step.title === 'string' && step.title.trim() &&
            typeof step.description === 'string' && step.description.trim() &&
            Number.isInteger(Number(step.order)) && Number(step.order) >= 1 &&
            (step.subcategory === undefined || typeof step.subcategory === 'string') &&
            (step.tags === undefined || (Array.isArray(step.tags) && step.tags.every(tag => typeof tag === 'string'))) &&
            (step.dueDate === undefined || step.dueDate === '' || (
                typeof step.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(step.dueDate)
            )) &&
            (step.image === undefined || step.image === '' || (
                typeof step.image === 'string' &&
                /^data:image\/[a-z0-9.+-]+;base64,[a-z0-9+/]+={0,2}$/i.test(step.image)
            )) &&
            (step.completed === undefined || typeof step.completed === 'boolean');
    },

    createStorageError(operation, cause) {
        const code = cause?.name === 'QuotaExceededError'
            ? 'storageFull'
            : operation === 'read' ? 'storageRead' : 'storageWrite';
        const message = cause?.name === 'QuotaExceededError'
            ? 'Browser storage is full. Export a backup and remove some images before saving more data.'
            : `Unable to ${operation} local data: ${cause?.message || 'browser storage is unavailable.'}`;
        const error = new Error(message);
        error.code = code;
        error.cause = cause;
        return error;
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageManager;
}
