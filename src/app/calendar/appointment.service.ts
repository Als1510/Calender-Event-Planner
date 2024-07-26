import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';
const currentDate = new Date();
@Injectable({
  providedIn: 'root'
})
export class AppointmentService {

  private appointments: { date: Date, appointments: { title: string, time: string }[] }[] = [];
  private appointmentsSubject = new BehaviorSubject<{ date: Date, appointments: { title: string, time: string }[] }[]>([
    {
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
      appointments: [{ title: "Sample 1", time: "11:00" }, { title: "Sample 2", time: "12:00" }]
    },
    {
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 2),
      appointments: [{ title: "Sample 3", time: "00:00" }, { title: "Sample 4", time: "13:00" }, { title: "Sample 5", time: "15:00" }]
    }
  ]);

  appointments$ = this.appointmentsSubject.asObservable();

  constructor(private snackBar: MatSnackBar) { }

  getAppointments(): { date: Date, appointments: { title: string, time: string }[] }[] {
    return this.appointmentsSubject.getValue();
  }

  addAppointment(newAppointment: { date: Date, title: string, time: string }): void {
    this.appointments.push({
      date: newAppointment.date,
      appointments: [{ title: newAppointment.title, time: newAppointment.time }]
    });
    this.appointmentsSubject.next(this.appointments);
  }

  updateAppointments(updatedAppointments: { date: Date, appointments: { title: string, time: string }[] }[]): void {
    this.appointments = updatedAppointments;
    this.appointmentsSubject.next(this.appointments);
  }

  deleteAppointment(date: Date, index: number): void {
    const dateStr = new Date(date).toDateString();
    const dateAppointments = this.appointments.find(a =>
      new Date(a.date).toDateString() === dateStr
    );

    if (dateAppointments) {
      dateAppointments.appointments.splice(index, 1);
      if (dateAppointments.appointments.length === 0) {
        this.appointments = this.appointments.filter(a =>
          new Date(a.date).toDateString() !== dateStr
        );
      }
      this.updateAppointments(this.appointments);
    }
  }
}
