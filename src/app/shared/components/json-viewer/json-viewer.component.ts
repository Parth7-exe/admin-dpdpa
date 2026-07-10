import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dpdpa-json-viewer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="json-container">
      <div class="json-header">
        <span class="json-title">{{ title }}</span>
        <button class="copy-btn" (click)="copyToClipboard()">
          <span *ngIf="!copied">📋 Copy JSON</span>
          <span *ngIf="copied" style="color: #34d399; font-weight: 600;">✔ Copied!</span>
        </button>
      </div>
      <pre class="json-body"><code [innerHTML]="highlightedJson"></code></pre>
    </div>
  `,
  styles: [`
    .json-container {
      background: #0b0f19;
      border-radius: 12px;
      border: 1px solid #1e293b;
      overflow: hidden;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
      margin: 20px 0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }
    .json-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #111827;
      padding: 10px 18px;
      border-bottom: 1px solid #1e293b;
    }
    .json-title {
      color: #9ca3af;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .copy-btn {
      background: #1f2937;
      color: #e5e7eb;
      border: 1px solid #374151;
      padding: 5px 12px;
      border-radius: 6px;
      font-size: 11px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s ease;
    }
    .copy-btn:hover {
      background: #374151;
      color: #fff;
    }
    .json-body {
      padding: 20px;
      margin: 0;
      overflow-x: auto;
      max-height: 480px;
      font-size: 13px;
      line-height: 1.6;
      color: #cbd5e1;
      text-align: left;
    }
  `]
})
export class JsonViewerComponent {
  highlightedJson = '';
  copied = false;
  private _data: any;

  @Input() title = 'Raw Response Payload';

  @Input()
  set data(value: any) {
    this._data = value;
    this.highlightedJson = this.syntaxHighlight(value);
  }

  get data(): any {
    return this._data;
  }

  copyToClipboard() {
    const rawStr = JSON.stringify(this._data, null, 2);
    navigator.clipboard.writeText(rawStr).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    });
  }

  private syntaxHighlight(json: any): string {
    if (!json) return '';
    let str = typeof json !== 'string' ? JSON.stringify(json, null, 2) : json;
    
    // Escape HTML characters
    str = str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Regexp matching json syntax parts
    return str.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g, (match) => {
      let cls = 'color: #f87171;'; // numbers (red)
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'color: #38bdf8; font-weight: 600;'; // keys (blue)
        } else {
          cls = 'color: #34d399;'; // strings (green)
        }
      } else if (/true|false/.test(match)) {
        cls = 'color: #fbbf24; font-weight: 600;'; // booleans (yellow)
      } else if (/null/.test(match)) {
        cls = 'color: #94a3b8; font-style: italic;'; // nulls (gray)
      }
      return `<span style="${cls}">${match}</span>`;
    });
  }
}
