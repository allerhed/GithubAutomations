/**
 * Web Form Widget for Lead Capture
 * Embeddable HTML form for capturing leads from website
 */

export interface FormConfig {
  apiEndpoint: string;
  fields?: {
    showPhone?: boolean;
    showCompany?: boolean;
    showJobTitle?: boolean;
    showProductInterest?: boolean;
    showGeography?: boolean;
    showMessage?: boolean;
  };
  customFields?: Array<{
    name: string;
    label: string;
    type: 'text' | 'email' | 'tel' | 'select';
    required?: boolean;
    options?: string[];
  }>;
  styling?: {
    primaryColor?: string;
    buttonText?: string;
    successMessage?: string;
  };
}

export class LeadCaptureForm {
  private config: FormConfig;
  private containerId: string;

  constructor(containerId: string, config: FormConfig) {
    this.containerId = containerId;
    this.config = {
      ...config,
      fields: config.fields || {},
      styling: config.styling || {}
    };
  }

  /**
   * Render the form in the specified container
   */
  render(): void {
    const container = document.getElementById(this.containerId);
    if (!container) {
      throw new Error(`Container ${this.containerId} not found`);
    }

    container.innerHTML = this.generateHTML();
    this.attachEventListeners();
  }

  /**
   * Generate HTML for the form
   */
  private generateHTML(): string {
    const primaryColor = this.config.styling?.primaryColor || '#007bff';
    const buttonText = this.config.styling?.buttonText || 'Submit';
    
    return `
      <style>
        .lead-capture-form {
          max-width: 500px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        }
        .lead-capture-form .form-group {
          margin-bottom: 15px;
        }
        .lead-capture-form label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #333;
        }
        .lead-capture-form input,
        .lead-capture-form select,
        .lead-capture-form textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          box-sizing: border-box;
        }
        .lead-capture-form textarea {
          min-height: 100px;
          resize: vertical;
        }
        .lead-capture-form button {
          background-color: ${primaryColor};
          color: white;
          padding: 12px 30px;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          width: 100%;
        }
        .lead-capture-form button:hover {
          opacity: 0.9;
        }
        .lead-capture-form button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .lead-capture-form .error-message {
          color: #dc3545;
          font-size: 12px;
          margin-top: 5px;
        }
        .lead-capture-form .success-message {
          background-color: #d4edda;
          color: #155724;
          padding: 15px;
          border-radius: 4px;
          margin-bottom: 15px;
        }
        .lead-capture-form .required::after {
          content: " *";
          color: #dc3545;
        }
      </style>
      
      <div class="lead-capture-form">
        <form id="lead-form">
          <div id="success-message" style="display: none;" class="success-message"></div>
          
          <div class="form-group">
            <label class="required" for="firstName">First Name</label>
            <input type="text" id="firstName" name="firstName" required>
            <div class="error-message" id="firstName-error"></div>
          </div>
          
          <div class="form-group">
            <label class="required" for="lastName">Last Name</label>
            <input type="text" id="lastName" name="lastName" required>
            <div class="error-message" id="lastName-error"></div>
          </div>
          
          <div class="form-group">
            <label class="required" for="email">Email</label>
            <input type="email" id="email" name="email" required>
            <div class="error-message" id="email-error"></div>
          </div>
          
          ${this.config.fields?.showPhone !== false ? `
          <div class="form-group">
            <label for="phone">Phone</label>
            <input type="tel" id="phone" name="phone">
          </div>
          ` : ''}
          
          ${this.config.fields?.showCompany !== false ? `
          <div class="form-group">
            <label for="company">Company</label>
            <input type="text" id="company" name="company">
          </div>
          ` : ''}
          
          ${this.config.fields?.showJobTitle !== false ? `
          <div class="form-group">
            <label for="jobTitle">Job Title</label>
            <input type="text" id="jobTitle" name="jobTitle">
          </div>
          ` : ''}
          
          ${this.config.fields?.showProductInterest !== false ? `
          <div class="form-group">
            <label for="productInterest">Product Interest</label>
            <input type="text" id="productInterest" name="productInterest">
          </div>
          ` : ''}
          
          ${this.config.fields?.showGeography !== false ? `
          <div class="form-group">
            <label for="geography">Location/Region</label>
            <input type="text" id="geography" name="geography">
          </div>
          ` : ''}
          
          ${this.config.fields?.showMessage !== false ? `
          <div class="form-group">
            <label for="message">Message</label>
            <textarea id="message" name="message"></textarea>
          </div>
          ` : ''}
          
          ${this.renderCustomFields()}
          
          <button type="submit" id="submit-btn">${buttonText}</button>
        </form>
      </div>
    `;
  }

  /**
   * Render custom fields
   */
  private renderCustomFields(): string {
    if (!this.config.customFields || this.config.customFields.length === 0) {
      return '';
    }

    return this.config.customFields.map(field => {
      const requiredClass = field.required ? 'required' : '';
      const requiredAttr = field.required ? 'required' : '';
      
      if (field.type === 'select' && field.options) {
        return `
          <div class="form-group">
            <label class="${requiredClass}" for="${field.name}">${field.label}</label>
            <select id="${field.name}" name="${field.name}" ${requiredAttr}>
              <option value="">Select...</option>
              ${field.options.map(opt => `<option value="${opt}">${opt}</option>`).join('')}
            </select>
          </div>
        `;
      } else {
        return `
          <div class="form-group">
            <label class="${requiredClass}" for="${field.name}">${field.label}</label>
            <input type="${field.type}" id="${field.name}" name="${field.name}" ${requiredAttr}>
          </div>
        `;
      }
    }).join('');
  }

  /**
   * Attach event listeners to the form
   */
  private attachEventListeners(): void {
    const form = document.getElementById('lead-form') as HTMLFormElement;
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit(form);
    });
  }

  /**
   * Handle form submission
   */
  private async handleSubmit(form: HTMLFormElement): Promise<void> {
    const submitBtn = document.getElementById('submit-btn') as HTMLButtonElement;
    const successMessage = document.getElementById('success-message');
    
    // Clear previous errors
    this.clearErrors();
    
    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      // Collect form data
      const formData = new FormData(form);
      const data: any = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone') || undefined,
        company: formData.get('company') || undefined,
        jobTitle: formData.get('jobTitle') || undefined,
        productInterest: formData.get('productInterest') || undefined,
        geography: formData.get('geography') || undefined,
        message: formData.get('message') || undefined,
        customFields: {}
      };

      // Add custom fields
      if (this.config.customFields) {
        for (const field of this.config.customFields) {
          const value = formData.get(field.name);
          if (value) {
            data.customFields[field.name] = value;
          }
        }
      }

      // Submit to API
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit form');
      }

      // Show success message
      if (successMessage) {
        successMessage.textContent = this.config.styling?.successMessage || 'Thank you! We will be in touch soon.';
        successMessage.style.display = 'block';
      }
      
      // Reset form
      form.reset();
      
    } catch (error) {
      this.showError('general', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = this.config.styling?.buttonText || 'Submit';
    }
  }

  /**
   * Show error message for a field
   */
  private showError(field: string, message: string): void {
    const errorElement = document.getElementById(`${field}-error`);
    if (errorElement) {
      errorElement.textContent = message;
    } else {
      alert(message);
    }
  }

  /**
   * Clear all error messages
   */
  private clearErrors(): void {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(el => {
      el.textContent = '';
    });
    
    const successMessage = document.getElementById('success-message');
    if (successMessage) {
      successMessage.style.display = 'none';
    }
  }
}
