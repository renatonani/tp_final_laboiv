import {
    trigger,
    state,
    style,
    animate,
    transition,
  } from '@angular/animations';
  
  export const fadeInOut = trigger('fadeInOut', [
    state('void', style({
      opacity: 0,
    })),
    transition('void <=> *', animate(800)),
  ]);


  export const slideInUp = trigger('slideInUp', [
    state('void', style({
      transform: 'translateY(100%)',
      opacity: 0
    })),
    transition('void => *', [
      animate('300ms ease-out', style({
        transform: 'translateY(0)',
        opacity: 1
      }))
    ]),
    transition('* => void', [
      animate('300ms ease-in', style({
        transform: 'translateY(100%)',
        opacity: 0
      }))
    ])
  ]);