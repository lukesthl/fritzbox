# ts-axios-digest-auth

[![npm package][npm-img]][npm-url]
[![Build Status][build-img]][build-url]
[![Downloads][downloads-img]][downloads-url]
[![Issues][issues-img]][issues-url]
[![Code Coverage][codecov-img]][codecov-url]
[![Commitizen Friendly][commitizen-img]][commitizen-url]
[![Semantic Release][semantic-release-img]][semantic-release-url]

> A library which implements HTTP digest authentication for axios clients. With generic typescript support

## Install

```bash
npm install @lukesthl/ts-axios-digest-auth
```

## Usage

```ts
import { AxiosDigestAuth } from '@lukesthl/ts-axios-digest-auth';

const digestAuthClient = new AxiosDigestAuth({
  username: MY_DIGEST_USERNAME,
  password: MY_DIGEST_PASSWORD,
});

await digestAuthClient.get('https://example.com');
```

## API

### AxiosDigestAuth

#### username

Type: `string`

#### password

Type: `string`

##### axios (optional)

Type: `AxiosInstance`

## Special Thanks

This is an fork of [@mhoc's](https://github.com/mhoc) [axios-digest-auth](https://github.com/mhoc/axios-digest-auth) package, with typescript support

[build-img]: https://github.com/lukesthl/ts-axios-digest-auth/actions/workflows/release.yml/badge.svg
[build-url]: https://github.com/lukesthl/ts-axios-digest-auth/actions/workflows/release.yml
[downloads-img]: https://img.shields.io/npm/dt/@lukesthl/ts-axios-digest-auth
[downloads-url]: https://www.npmtrends.com/@lukesthl/ts-axios-digest-auth
[npm-img]: https://img.shields.io/npm/v/@lukesthl/ts-axios-digest-auth
[npm-url]: https://www.npmjs.com/package/@lukesthl/ts-axios-digest-auth
[issues-img]: https://img.shields.io/github/issues/lukesthl/ts-axios-digest-auth
[issues-url]: https://github.com/lukesthl/ts-axios-digest-auth/issues
[codecov-img]: https://codecov.io/gh/lukesthl/ts-axios-digest-auth/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/lukesthl/ts-axios-digest-auth
[semantic-release-img]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg
[semantic-release-url]: https://github.com/semantic-release/semantic-release
[commitizen-img]: https://img.shields.io/badge/commitizen-friendly-brightgreen.svg
[commitizen-url]: http://commitizen.github.io/cz-cli/
