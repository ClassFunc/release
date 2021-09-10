#!/usr/bin/env node
const vorpal = require('vorpal')();
const {execSync} = require('child_process');

async function github(args, cb, self) {
  // const self = this;
  const file = fpath('/release_github.sh');
  let from = cmd(`git describe --tags --abbrev=0`,
      `git rev-list --max-parents=0 HEAD`);
  let to = cmd(`git branch --show-current`);

  await self.prompt({
    type: 'input',
    name: 'from',
    default: from,
    message: '? from commit hash or tag or branch: ',
  }, function(result) {
    // console.log(result);
    from = result.from;
  });
  await self.prompt({
    type: 'input',
    name: 'to',
    default: to,
    message: '? to commit hash or tag or branch: ',
  }, function(result) {
    // console.log(result);
    to = result.to;
  });
  self.log(sh(file, from, to));
}

vorpal.command('github').action(function(args, cb) {
  return github(args, cb, this);
});

vorpal.command('gh').action(function(args, cb) {
  return github(args, cb, this);
});

async function report(args, cb, file, self) {
  // const self = this;
  let on = cmd(`git branch --show-current`);
  let since = cmd(`date -v1d -v"$(date '+%m')"m '+%F'`);
  let until = cmd(`date "+%F"`);

  await self.prompt({
    type: 'input',
    name: 'on',
    default: on,
    message: '? on tag or branch: ',
  }, function(result) {
    // console.log(result);
    on = result.on;
  });
  await self.prompt({
    type: 'input',
    name: 'since',
    default: since,
    message: '? since date: ',
  }, function(result) {
    // console.log(result);
    since = result.since;
  });
  await self.prompt({
    type: 'input',
    name: 'until',
    default: until,
    message: '? until date: ',
  }, function(result) {
    // console.log(result);
    until = result.until;
  });

  self.log(sh(file, on, since, until));
}

vorpal.command('md').action(async function(args, cb) {
  const file = fpath('/report-month-md-all.sh');
  return report(args, cb, file, this);
});

vorpal.command('mdu').action(async function(args, cb) {
  const file = fpath('/report-month-md-by-user.sh');
  return report(args, cb, file, this);
});

vorpal.command('csv').action(async function(args, cb) {
  const file = fpath('/report-month-csv-all.sh');
  return report(args, cb, file, this);
});

vorpal.delimiter('release $').show();

//helpers
function sh(...args) {
  let result;
  try {
    result = execSync(`sh "${args.join('" "')}"`).toString().trim();
  } catch (e) {
    if (e.status !== 0) {
      //error
      result = e.stderr;
    }
  }
  return result;
}

function cmd(str, str2) {
  let result;
  try {
    result = execSync(str).toString().trim();
  } catch (e) {
    if (e.status !== 0) {
      //error
      result = cmd(str2);
    }
  }
  return result;
}

function fpath(name) {
  return __dirname + name;
}
