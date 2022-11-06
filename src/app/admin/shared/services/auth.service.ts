import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { catchError, Observable, Subject, tap, throwError } from 'rxjs'
import { environment } from '../../../../environments/environment'
import { FbAuthResponse, User } from '../../../shared/interfaces'

@Injectable({ providedIn: 'root' })
export class AuthService {

  public error$: Subject<string> = new Subject<string>()

  get token(): string | null {
    const token = localStorage.getItem('fb-token')
    const date = localStorage.getItem('fb-token-exp')

    if (!token || !date) {
      return null
    }

    const expDate = new Date(date)

    if (new Date() > expDate) {
      this.logout()
      return null
    }

    return token
  }

  constructor(private http: HttpClient) {
  }

  login(user: User): Observable<any> {
    user.returnSecureToken = true

    return this.http.post<FbAuthResponse>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.apiKey}`, user)
      .pipe(
        tap(this.setToken),
        catchError(this.handleError.bind(this)),
      )
  }

  logout() {
    this.setToken(null)
  }

  isAuthenticated(): boolean {
    return !!this.token
  }

  private handleError(error: HttpErrorResponse) {
    const { message } = error.error.error

    switch (message) {
      case 'INVALID_EMAIL':
        this.error$.next('Wrong email')
        break
      case 'INVALID_PASSWORD':
        this.error$.next('Wrong password')
        break
      case 'EMAIL_NOT_FOUND':
        this.error$.next('Email not found')
        break
    }

    return throwError(error)
  }

  private setToken(response: FbAuthResponse | null ) {
    if (response) {
      const expDate = new Date(new Date().getTime() + +response.expiresIn * 1000)
      localStorage.setItem('fb-token', response.idToken)
      localStorage.setItem('fb-token-exp', expDate.toString())
    } else {
      localStorage.clear()
    }
  }

}
