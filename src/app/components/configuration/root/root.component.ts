import { Component, OnInit, } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { map, filter, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss']
})
export class RootComponent implements OnInit {
  pageTitle: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    /*  this.router.events.pipe(
     filter((event) => event instanceof NavigationEnd),
     map(() => this.activatedRoute),
     map((route) => {
       while (route.firstChild) { route = route.firstChild; }
       return route;
     }),
     filter((route) => route.outlet === 'primary'),
     mergeMap((route) => route.data),
     subscribe((event) => this.pageTitle = event['title']); */
  }
}
