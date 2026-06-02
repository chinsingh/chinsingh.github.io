---
title: "JavaScript's module mess"
date: 2024-06-12
display_date: June 12, 2024
section: Stories
field: Software
---

_Disclaimer: If you are using bun runtime, then you don’t need to worry about this mess. Can’t comment on other aspects of it since I haven’t used it, but Bun has cleared this mess in its world._

* * *

In the beninging, there were no modules.

Then, BANG! ✨Common JS ✨

Then, BANG! ✨ES Modules ✨

It has been constant bangs since.

* * *

JavaScript was not intended to be used on such a scale as it is today. For this reason, it had minimal features. One feature which was missing from the language was _modules_. As the usage and code base of the language grew, fueled by node JS, libraries like Common JS popped up providing this option. The ECMA guys, who release newer JavaScript versions, thought this was a cool idea too, and decided to support it natively starting JavaScript version ES6. This led to a whole bunch of mess and clashes which hasn’t stopped since then.

Here’s why —

### Differences and Incompatibility

The common JS library uses the `require` and `module.exports` syntax for importing and exporting modules, while the ES module system uses `import` and `export` syntax.

Common JS importing mechanism is synchronous, while ES modules are imported asynchronously. Which is one reason ECMA didn’t use the already existing `require` syntax.

The problem, however, arose with the incompatibility of the two. While you can import Common JS modules in an ES project, it doesn’t work the other way round. So, there is an interoperability problem at its core, which cascaded to cause conflicts.

ES did decide to keep itself backwards compatible to allow for gradual adoption of its module system. Keeping ES as default would mean rewriting or transpiling all that code. Keeping CommonJS as default maintains compatibility with existing projects.

What went wrong is —

*  CommonJS not allowing to import ES modules.
*  Limited browser support for Common JS: Most modern browsers natively support ES Modules, but they have limited to no support for CommonJS module. So if your ES code is going to be used in a browser and it imports a CommonJS module, it will break.

The incompatibility goes both ways.

### Co-existence?

What if both Common JS and ES Modules could co-exist. It would be great for everyone, and JavaScript developers could live happily ever after quarrelling over other conflicts in the JS land.

To date, there are only some workarounds to achieve this in node JS and browsers, but there are still gaps because of the incompatibility.

If you’re shipping a package, you have to be careful. Depending on the consumers of your package, you have to ship the versions or even different versions to cater to both kinds of users.

Shipping different versions is one option. But again, if your consumers somehow end up importing both versions of your package, this could cause [Dual Package Hazard](https://github.com/GeoffreyBooth/dual-package-hazard).

### The One True King

ESM is the one module system which works everywhere. All node versions with long term support are now using ESM.

If you’re starting with a project, or even have an existing project, it’s time you adopt ES Modules and make the JavaScript world a little less complex place to code.

##### WARNING: What you emit is who you really are

Bundlers offer a sort of workaround for this, by converting all your code to a single module system. But _the bundler lies_.

You might be thinking that you are using ES module system, but it is possible your bundler is transpiling your modules into common JS.