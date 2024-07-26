import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppointmentService } from '../appointment.service';

@Component({
  selector: 'app-add-appointment-dialog',
  templateUrl: './add-appointment-dialog.component.html',
  styleUrls: ['./add-appointment-dialog.component.css']
})
export class AddAppointmentDialogComponent {
  appointmentForm: FormGroup;
  isEditing: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<AddAppointmentDialogComponent>,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private appointmentService: AppointmentService
  ) {
    this.isEditing = !!data.appointment;
    this.appointmentForm = this.fb.group({
      title: [data?.appointment?.title || '', Validators.required],
      date: [data?.date || data || '', Validators.required],
      time: [data?.appointment?.time || '']
    });
  }

  onSave(): void {
    if (this.appointmentForm.valid) {
      this.dialogRef.close(this.appointmentForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  deleteAppointment(): void {
    if (this.isEditing) {
      const appointmentData = this.data.appointment;
      const dateStr = new Date(this.data.date).toDateString();
      const appointments = this.appointmentService.getAppointments();

      const dateAppointments = appointments.find(a =>
        new Date(a.date).toDateString() === dateStr
      );

      if (dateAppointments) {
        const index = dateAppointments.appointments.findIndex(
          appt => appt.title === appointmentData.title && appt.time === appointmentData.time
        );

        if (index > -1) {
          this.appointmentService.deleteAppointment(this.data.date, index);
        }
      }
      this.dialogRef.close();
    }
  }
}
