import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AddAppointmentDialogComponent } from '../add-appointment-dialog/add-appointment-dialog.component';
import { AppointmentService } from '../appointment.service';

@Component({
  selector: 'app-calendar-view',
  templateUrl: './calendar-view.component.html',
  styleUrls: ['./calendar-view.component.css']
})
export class CalendarViewComponent implements OnInit {
  data: { date: Date, appointments: { title: string, time: string }[] }[] = [];
  currentMonth: Date = new Date();
  daysInMonth: Date[] = [];
  appointmentColors: string[] = [
    '#3f51b5', '#4caf50', '#f44336', '#ff9800', '#9c27b0', '#2196f3', '#ff5722'
  ];

  constructor(
    private appointmentService: AppointmentService,
    public dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.appointmentService.appointments$.subscribe(appointments => {
      this.data = appointments;
      this.updateCalendar();
    });
    this.updateCalendar();
  }

  updateCalendar(): void {
    const start = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const end = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
    this.daysInMonth = [];
    for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
      this.daysInMonth.push(new Date(d));
    }
  }

  previousMonth(): void {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() - 1));
    this.updateCalendar();
  }

  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() + 1));
    this.updateCalendar();
  }

  getAppointmentsForDay(day: Date): { title: string, time: string }[] {
    const dayAppointments = this.data.find(d => d.date.toDateString() === day.toDateString());
    return dayAppointments ? dayAppointments.appointments : [];
  }

  drop(event: CdkDragDrop<{ title: string, time: string }[]>, day: Date) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const previousDay = this.data.find(d => d.date.toDateString() === event.previousContainer.id);
      let currentDay = this.data.find(d => d.date.toDateString() === day.toDateString());

      if (previousDay) {
        if (!currentDay) {
          currentDay = { date: day, appointments: [] };
          this.data.push(currentDay);
        }

        transferArrayItem(
          event.previousContainer.data,
          currentDay.appointments,
          event.previousIndex,
          event.currentIndex
        );

        this.appointmentService.updateAppointments(this.data);
      }
    }
  }

  openAddAppointmentDialog(date: Date, appointment?: { title: string, time: string }): void {
    let dateIndex = this.data.findIndex(d => d.date.toDateString() === date.toDateString());
    if (dateIndex === -1) {
      this.data.push({ date, appointments: [] });
      dateIndex = this.data.length - 1;
    }
    const dialogRef = this.dialog.open(AddAppointmentDialogComponent, {
      width: '400px',
      data: appointment ? { date, appointment } : { date }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (appointment) {
          const appointmentIndex = this.data[dateIndex].appointments.indexOf(appointment);
          if (appointmentIndex > -1) {
            this.data[dateIndex].appointments[appointmentIndex] = result;
            this.appointmentService.updateAppointments(this.data);
          }
        } else {
          this.data[dateIndex].appointments.push(result);
          this.appointmentService.addAppointment(result);
        }
      }
    });
  }

  onAppointmentClick(day: Date, appointment: any): void {
    this.openAddAppointmentDialog(day, appointment)
  }

  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }

  getAppointmentColor(appointment: { title: string, time: string }): string {
    const hash = this.hashCode(appointment.title);
    const index = Math.abs(hash % this.appointmentColors.length);
    return this.appointmentColors[index];
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const character = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + character;
      hash = hash & hash;
    }
    return hash;
  }
}
