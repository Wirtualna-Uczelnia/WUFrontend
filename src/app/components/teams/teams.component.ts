import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {AddTeamDialogComponent} from './add-team-dialog/add-team-dialog.component';
import {ToastrService} from 'ngx-toastr';
import {UserAuthService} from '../../core/services/user-auth.service';
import {TeamsService} from '../../core/services/teams.service';
import {Observable, Subscription} from 'rxjs';
import {map} from 'rxjs/operators';
import {Team} from '../../core/models/team/team.model';

@Component({
  selector: 'app-teams',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.css']
})
export class TeamsComponent implements OnInit, OnDestroy {
  teams: Team[];
  teamsCount: number;
  teamsPerPage = 5;
  totalPagesCount;
  paginationButtonsCount = 3;
  displayedFrom: number;
  displayedTo: number;
  paginationButtonsValues: number[] = [1, 2, 3];
  isTeacher = false;
  page: number;

  constructor(private router: Router, public dialog: MatDialog, private toastr: ToastrService, private authService: UserAuthService,
              private route: ActivatedRoute, private teamsService: TeamsService) {
    this.isTeacher = !this.authService.currentUserValue.isStudent;
  }

  openDialog() {
    const dialogRef = this.dialog.open(AddTeamDialogComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== false) {
        this.toastr.success('Zespół został stworzony', '', {timeOut: 2000});
        if (this.teamsCount < 5){
          this.teams.push(result);
        }
        this.teamsCount++;
        this.updateValuesAfterDataReceived();
      } else if (result === false) {
        this.toastr.error('Błąd podczas tworzenia zespołu', '', {timeOut: 2000});
      }
    });
  }

  ngOnDestroy() {
    this.dialog.closeAll();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.page = +params.page;
      if (isNaN(this.page) || this.page <= 0) {
        this.page = 1;
      }

      this.teamsService.getTeams(this.page).pipe(
        map((data) => {
          // @ts-ignore
          this.teamsCount = data.totalCount;
          // @ts-ignore
          this.updateValuesAfterDataReceived();
          // @ts-ignore
          this.teams = data.teams;
        })
      ).subscribe();
    });
  }

  updateValuesAfterDataReceived() {
    this.totalPagesCount = Math.ceil(this.teamsCount / this.teamsPerPage);
    // @ts-ignore
    if (this.page > this.totalPagesCount) {
      this.page = this.totalPagesCount;
    }
    if (this.teamsCount > 0) {
      for (let i = 0; i < 3; i++) {
        this.paginationButtonsValues[i] = this.getPaginationButtonNumber(i + 1);
      }
      this.displayedFrom = (this.page - 1) * this.teamsPerPage + 1;
      this.displayedTo = (this.page * this.teamsPerPage) > this.teamsCount ? this.teamsCount : (this.page * this.teamsPerPage);
    }
  }

  onTeamSelected(index: number) {
    this.router.navigate(['/teams/' + index]);
  }

  getPaginationButtonNumber(index): number {
    if (this.page % this.paginationButtonsCount === 0) {
      return (Math.floor(this.page / this.paginationButtonsCount) - 1) * this.paginationButtonsCount + index;
    }
    return Math.floor(this.page / this.paginationButtonsCount) * this.paginationButtonsCount + index;
  }

}
