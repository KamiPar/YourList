import { NgModule, ModuleWithProviders, SkipSelf, Optional } from '@angular/core';
import { Configuration } from './configuration';
import { HttpClient } from '@angular/common/http';


@NgModule({
  imports:      [],
  declarations: [],
  exports:      [],
  providers: []
})
export class SharedDataAccessApiModule {
    public static forRoot(configurationFactory: () => Configuration): ModuleWithProviders<SharedDataAccessApiModule> {
        return {
            ngModule: SharedDataAccessApiModule,
            providers: [ { provide: Configuration, useFactory: configurationFactory } ]
        };
    }

    constructor( @Optional() @SkipSelf() parentModule: SharedDataAccessApiModule,
                 @Optional() http: HttpClient) {
        if (parentModule) {
            throw new Error('SharedDataAccessApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
            'See also https://github.com/angular/angular/issues/20575');
        }
    }
}
