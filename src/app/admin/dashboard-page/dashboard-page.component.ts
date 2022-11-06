import { Component, OnDestroy, OnInit } from '@angular/core'
import { Subscription } from 'rxjs'
import { Post } from '../../shared/interfaces'
import { PostService } from '../../shared/post.service'
import { AlertService } from '../shared/services/alert.service'

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
})
export class DashboardPageComponent implements OnInit, OnDestroy {

  posts: Post[] = []
  pSub: Subscription
  dSub: Subscription
  searchStr = ''

  constructor(
    private postsService: PostService,
    private alert: AlertService
  ) {
  }

  ngOnInit(): void {
    this.pSub = this.postsService.getAll()
      .subscribe(posts => {
        this.posts = posts
      })
  }

  remove(id: string | undefined) {
    if (!id) {
      return
    }

    this.dSub = this.postsService.remove(id)
      .subscribe(() => {
        this.posts = this.posts.filter(post => post.id !== id)
        this.alert.warning('Post was deleted')
      })
  }

  ngOnDestroy(): void {
    if (this.pSub) {
      this.pSub.unsubscribe()
    }

    if (this.dSub) {
      this.dSub.unsubscribe()
    }
  }
}

