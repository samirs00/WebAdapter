import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  mobileQuery: MediaQueryList;
  
 
  // fillerNav = Array.from({ length: 50 }, (_, i) => `Nav Item ${i + 1}`);
  private _mobileQueryListener: () => void;
  constructor(private router: Router,
    private route: ActivatedRoute,
    changeDetectorRef: ChangeDetectorRef,
    media: MediaMatcher){
      this.mobileQuery = media.matchMedia('(max-width: 600px)');
      this._mobileQueryListener = () => changeDetectorRef.detectChanges();
      this.mobileQuery.addListener(this._mobileQueryListener);
    }

  ngOnInit() {
    // let botId = this.route.snapshot.params.botId;
    // let tokenId = this.route.snapshot.params.tokenId;
    // console.log("botid :", botId, "tokenId :", tokenId)
    // this.router.navigate(['/botId',botId,'/tokenId', tokenId]);
    // this.router.navigate(['/botId'], { queryParams: { 'botId': '**', 'tokenId': '**' } });

  }

}
