import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'lib-feature-lists-details',
  imports: [],
  changeDetection:ChangeDetectionStrategy.OnPush,
  templateUrl: './feature-lists-details.html',
  styleUrl: './feature-lists-details.scss',
})
export class FeatureListsDetails {}
