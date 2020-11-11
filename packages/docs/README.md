# `@stencil/docs`

> To capture and record stories for all common components and enable storybook in the codebase

## Usage

```
For adding a new vertical or package category to storybook display, modify /.storybook/main.js
Under stories: [
  ...,
  'add new regex lookup entry for path to source like: ../../../verticals/app/src/**/*.stories.(js|mdx|ts|tsx)'
]
Note - Here ** recursively looks through all folders available under matching pattern prefix of app/src/
```
