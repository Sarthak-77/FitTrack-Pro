/**
 * Modern Modal System for FitTrack Pro
 * Replaces native browser alerts, confirms, and prompts with styled modals
 */

// Create modal container if it doesn't exist
function ensureModalContainer() {
    let container = document.getElementById('modal-root');
    if (!container) {
        container = document.createElement('div');
        container.id = 'modal-root';
        document.body.appendChild(container);
    }
    return container;
}

// Base modal creation
function createModalElement(content, options = {}) {
    const overlay = document.createElement('div');
    overlay.className = 'modern-modal-overlay';
    overlay.innerHTML = `
        <div class="modern-modal ${options.type || ''}">
            ${content}
        </div>
    `;

    // Close on overlay click (optional)
    if (options.closeOnOverlay !== false) {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay && options.onClose) {
                options.onClose();
            }
        });
    }

    // Animate in
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });

    return overlay;
}

// Close modal with animation
function closeModal(overlay, callback) {
    overlay.classList.remove('active');
    setTimeout(() => {
        overlay.remove();
        if (callback) callback();
    }, 300);
}

/**
 * Show Alert Modal
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @param {string} type - 'success' | 'error' | 'warning' | 'info'
 */
export function showAlert(title, message, type = 'info') {
    return new Promise((resolve) => {
        const container = ensureModalContainer();

        const iconMap = {
            success: '<svg class="modal-icon success" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error: '<svg class="modal-icon error" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            warning: '<svg class="modal-icon warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
            info: '<svg class="modal-icon info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };

        const content = `
            <div class="modal-header">
                ${iconMap[type] || iconMap.info}
                <h3>${title}</h3>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-actions">
                <button class="btn btn-primary modal-ok-btn">OK</button>
            </div>
        `;

        const overlay = createModalElement(content, { type, closeOnOverlay: true, onClose: resolve });
        container.appendChild(overlay);

        const okBtn = overlay.querySelector('.modal-ok-btn');
        okBtn.addEventListener('click', () => closeModal(overlay, resolve));
        okBtn.focus();
    });
}

/**
 * Show Confirm Modal
 * @param {string} title - Modal title
 * @param {string} message - Modal message
 * @returns {Promise<boolean>} - true if confirmed, false if cancelled
 */
export function showConfirm(title, message) {
    return new Promise((resolve) => {
        const container = ensureModalContainer();

        const content = `
            <div class="modal-header">
                <svg class="modal-icon warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <h3>${title}</h3>
            </div>
            <div class="modal-body">
                <p>${message}</p>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary modal-cancel-btn">Cancel</button>
                <button class="btn btn-danger modal-confirm-btn">Confirm</button>
            </div>
        `;

        const overlay = createModalElement(content, { type: 'confirm', closeOnOverlay: false });
        container.appendChild(overlay);

        overlay.querySelector('.modal-cancel-btn').addEventListener('click', () => {
            closeModal(overlay, () => resolve(false));
        });

        overlay.querySelector('.modal-confirm-btn').addEventListener('click', () => {
            closeModal(overlay, () => resolve(true));
        });

        overlay.querySelector('.modal-confirm-btn').focus();
    });
}

/**
 * Show Prompt Modal with multiple fields
 * @param {string} title - Modal title
 * @param {Array} fields - Array of field objects { name, label, type, value, placeholder }
 * @returns {Promise<Object|null>} - Object with field values or null if cancelled
 */
export function showPrompt(title, fields) {
    return new Promise((resolve) => {
        const container = ensureModalContainer();

        const fieldsHTML = fields.map(field => `
            <div class="modal-field">
                <label for="modal-${field.name}">${field.label}</label>
                <input 
                    type="${field.type || 'text'}" 
                    id="modal-${field.name}" 
                    name="${field.name}"
                    value="${field.value || ''}"
                    placeholder="${field.placeholder || ''}"
                    ${field.required ? 'required' : ''}
                >
            </div>
        `).join('');

        const content = `
            <div class="modal-header">
                <svg class="modal-icon info" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <h3>${title}</h3>
            </div>
            <form class="modal-body modal-form">
                ${fieldsHTML}
            </form>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary modal-cancel-btn">Cancel</button>
                <button type="submit" class="btn btn-primary modal-submit-btn">Save</button>
            </div>
        `;

        const overlay = createModalElement(content, { type: 'prompt', closeOnOverlay: false });
        container.appendChild(overlay);

        const form = overlay.querySelector('.modal-form');
        const firstInput = form.querySelector('input');
        if (firstInput) firstInput.focus();

        overlay.querySelector('.modal-cancel-btn').addEventListener('click', () => {
            closeModal(overlay, () => resolve(null));
        });

        overlay.querySelector('.modal-submit-btn').addEventListener('click', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const result = {};
            fields.forEach(field => {
                result[field.name] = formData.get(field.name);
            });

            // Validate required fields
            const allFilled = fields.every(field => {
                if (field.required && !result[field.name]) return false;
                return true;
            });

            if (!allFilled) {
                showAlert('Missing Fields', 'Please fill in all required fields.', 'warning');
                return;
            }

            closeModal(overlay, () => resolve(result));
        });

        // Handle Enter key submission
        form.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                overlay.querySelector('.modal-submit-btn').click();
            }
        });
    });
}

// Make functions available globally for inline onclick handlers
window.showAlert = showAlert;
window.showConfirm = showConfirm;
window.showPrompt = showPrompt;
