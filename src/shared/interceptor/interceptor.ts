import { Http, RequestOptionsArgs, Response, RequestOptions, ConnectionBackend, Headers } from '@angular/http';
import { Events } from 'ionic-angular';
import { Observable } from 'rxjs/Observable';
import { Storage } from '@ionic/storage';
import 'rxjs/add/operator/map';
import { Config } from '../config/app.config';

export class HttpInterceptor extends Http {
    public token: any;
    private _apiUrl: string = Config.apiUrl;

    constructor(connectionBackend: ConnectionBackend, requestOptions: RequestOptions, private _storage: Storage, private _events: Events) {
        super(connectionBackend, requestOptions);
        this._getToken();
    }

    public get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this._intercept(super.get(url, this._getRequestOptionArgs(options)));
    }

    public post(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
        return this._intercept(super.post(url, body, this._getRequestOptionArgs(options)));
    }

    public put(url: string, body: string, options?: RequestOptionsArgs): Observable<Response> {
        return this._intercept(super.put(url, body, this._getRequestOptionArgs(options)));
    }

    public delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this._intercept(super.delete(url, this._getRequestOptionArgs(options)));
    }

    private _getToken(): void {
        this._storage.get('token').then((token) => {
            this.token = token;            
        });
    }

    private _getRequestOptionArgs(options?: RequestOptionsArgs): RequestOptionsArgs {
        if (options === null) {
            options = new RequestOptions();
        }

        if (options === undefined) {
            options = new RequestOptions();
        }

        if (options.headers === null) {
            let headers: Headers = new Headers();
            headers.append('Authorization', 'Bearer ' + this.token);
            options.headers = headers;
        }
        options.headers.append('Content-Type', 'application/json');
        return options;
    }

    private _intercept(observable: Observable<Response>): Observable<Response> {
        return observable.catch((err: any) => {
            if (err.status === 401 && !err.startsWith(err.url, this._apiUrl)) {
                this._cleanup();
                this._events.publish('token:error');
                return Observable.empty();
            }
            else {
                return Observable.throw(err);
            }
        });
    };

    private _cleanup(): void {
        this._storage.remove('token');
    }
}
