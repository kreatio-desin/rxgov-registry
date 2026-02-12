import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

/**
 * Shared Module
 * Contains reusable components, pipes, directives, and utilities
 * Can be imported by feature modules
 */
@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class SharedModule {}
