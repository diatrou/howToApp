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

        if (!data) return [];

        let steps;
        try {
            steps = JSON.parse(data);
        } catch (error) {
            const invalidDataError = new Error('Saved data is not valid JSON. Import a backup to recover your steps.');
            invalidDataError.cause = error;
            throw invalidDataError;
        }

        if (!Array.isArray(steps) || !steps.every(this.isValidStep)) {
            throw new Error('Saved data has an invalid format. Import a valid backup to recover your steps.');
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
            throw new Error('The step to update could not be found.');
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

    writeSteps(steps) {
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
            typeof step.category === 'string' &&
            typeof step.title === 'string' &&
            typeof step.description === 'string' &&
            Number.isFinite(Number(step.order)) && Number(step.order) >= 1 &&
            (!step.subcategory || typeof step.subcategory === 'string') &&
            (!step.image || (typeof step.image === 'string' && /^data:image\/[a-z0-9.+-]+;base64,/i.test(step.image))) &&
            (step.completed === undefined || typeof step.completed === 'boolean');
    },

    createStorageError(operation, cause) {
        const message = cause?.name === 'QuotaExceededError'
            ? 'Browser storage is full. Export a backup and remove some images before saving more data.'
            : `Unable to ${operation} local data: ${cause?.message || 'browser storage is unavailable.'}`;
        const error = new Error(message);
        error.cause = cause;
        return error;
    }
};
