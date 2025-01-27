# `vitest-image-snapshot-matcher`

A simple `vitest` matcher extension for matching images snapshots.

## Usage

```typescript
import { createToMatchImageSnapshot } from 'vitest-image-snapshot-matcher';
import { expect } from 'vitest';

expect.extend({
    toMatchImageSnapshot: createToMatchImageSnapshot(),
});
```

## Features

- [x] Match against snapshots
- [x] Write missing snapshots
- [x] Side-by-side comparison diffs
- [x] Update snapshots
