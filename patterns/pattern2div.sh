#! /bin/bash

#          <div class="row">
#
#            <div class="col-md-4">A</div>
#            <div class="col-md-4">B</div>
#            <div class="col-md-4">C</div>
#          </div>
#        </div>
#      </div>
#    </div>

letters="1 2 3 4 5 6 7 8 9 a b c d e f g h i j k l m n o p q r s t u v w x z"

for letter in $letters
do
    uletter=$(echo $letter|tr a-z A-Z)
cat <<EOD
    <div class="panel panel-default">
      <div class="panel-heading" data-toggle="collapse" data-paren="#accordion" data-target="#collapse${uletter}">
        <h4 class="panel-title">${uletter}</h4>
      </div>
      <div id="collapse${uletter}" class="panel-collapse collapse">
        <div class="panel-body">
EOD
  count=0
  for f in ${letter}*105*
  do
    if [ $(($count % 3)) -eq 0 ]
    then
      echo "          <div class=\"row\">"
    fi
    name=$(grep '#.*Name' $f|sed -e 's/.*Name: //g' -e 's///g')
    echo "            <div class=\"col-md-4\"><a target=\"_blank\" href=\"pattern.html?pattern=$f\">$name</a></div>"
    #echo -e "$name | \c"
    if [ $(($count % 3)) -eq 2 ]
    then
      echo "          </div>"
    fi
    ((count++))
  done
    if [ $(($count % 3)) -ne 0 ]
    then
      echo "          </div>"
    fi
  echo "        </div>"
  echo "      </div>"
  echo "    </div>"
done
