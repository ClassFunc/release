# tham khao:
# https://github.com/github/hub/issues/2118,
# https://stackoverflow.com/questions/8136178/git-log-between-tags
# https://stackoverflow.com/questions/39253307/export-git-log-into-an-excel-file

 # shellcheck disable=SC2046
# clear

SINCE=$(date -v1d -v"$(date '+%m')"m '+%F') #first day of month
echo "since date ($SINCE): \c" #default current branch
read -r since_date
[ -n "$since_date" ] && SINCE=$since_date

UNTIL=$(date "+%F") #today
echo "until date ($UNTIL): \c"
read -r until_date
[ -n "$until_date" ] && UNTIL=$until_date

ON_TAG=$(git branch --show-current)
echo "of tag or branch ($ON_TAG): \c" #default current branch
read -r on_tag
[ -n "$on_tag" ] && ON_TAG=$on_tag

DIR=release_month_report
FILE=$DIR/"$SINCE-to-$UNTIL-all.md"

if [[ ! -e $FILE ]]; then
  mkdir -p $DIR
  touch "$FILE"
fi

echo -e "
Pull Request from $SINCE to $UNTIL on \`$ON_TAG\`

---

| PR      | Title   | By | Date     |
| :---    | :---   | :--- | :--- |" > "$FILE"

LOG=$(git log --merges\
  "$ON_TAG"\
 --since="$SINCE"\
 --until="$UNTIL"\
 --grep='Merge pull request'\
 --pretty=format:"%s __end_subject__   | %b | %an | %cs |"
 )

# shellcheck disable=SC2001
echo "$LOG" \
| sed "s/Merge pull request/\|/"\
| sed "s/from.*__end_subject__//g"\
>> "$FILE"