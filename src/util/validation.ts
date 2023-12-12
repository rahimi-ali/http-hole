export type ValidationRule = (value: any) => true|string;

interface SuccessfulValidationResult {
    valid: true;
    validated: Record<string, any>;
}

interface FailedValidationResult {
    valid: false;
    errors: Record<string, string>;
}

export type ValidationResult = SuccessfulValidationResult|FailedValidationResult;

export function validate(data: Record<string, any>, schema: Record<string, ValidationRule[]>): ValidationResult {
    const errors: Record<string, string> = {};
    const validated: Record<string, any> = {};
    
    Object.entries(schema).forEach(([key, rules]) => {
        const value = data[key];
    
        for (const rule of rules) {
            const error = rule(value);
            if (error !== true) {
                errors[key] = error;
                return;
            }
        }

        if (value !== undefined) {
            validated[key] = value;
        }
    });
    
    if (Object.keys(errors).length === 0) {
        return { valid: true, validated };
    } else {
        return { valid: false, errors };
    }
}

export const required: ValidationRule = (value) => {
    if (value === undefined || value === null || value === '') {
        return 'This field is required.';
    }

    return true;
};

export function stringType(value: any) {
    if (value === undefined || value === null || value === '') {
        return true;
    }

    if (typeof value !== 'string') {
        return 'This field must be a string.';
    }

    return true;
}

export function matchRegex(regex: RegExp) {
    return (value: any) => {
        if (value === undefined || value === null || value === '') {
            return true;
        }

        if (!regex.test(value)) {
            return `This field does not match the required format (${regex}).`;
        }

        return true;
    }
}