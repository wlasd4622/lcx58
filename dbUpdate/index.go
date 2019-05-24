package main

import (
	"crypto/md5"
	"database/sql"
	"encoding/hex"
	"fmt"
	"strconv"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

const (
	// dbusername+":"+dbpassword+"@tcp("+dbhostip+")/"+dbname+"?charset=utf8"
	// DB_Driver = "refresh:Dianzhijia@1@tcp(101.201.49.69:3306)/refresh?charset=utf8"
	DB_Driver = "readonly43:dzj123456@tcp(rm-8vbi768p70fp32qv74o.mysql.zhangbei.rds.aliyuncs.com:3306)/dianzhijia?charset=utf8"
)

func OpenDB() (success bool, db *sql.DB) {
	var isOpen bool
	db, err := sql.Open("mysql", DB_Driver)
	if err != nil {
		isOpen = false
	} else {
		isOpen = true
	}
	CheckErr(err)
	return isOpen, db
}
func QueryFromDB(db *sql.DB) {
	rows, err := db.Query("SELECT url from generalizes where post_type=7 and `status`=17")
	CheckErr(err)
	if err != nil {
		fmt.Println("error:", err)
	} else {
	}
	for rows.Next() {
		var url string
		err := rows.Scan(&url)
		CheckErr(err)
		fmt.Println(url)
	}
}
func CheckErr(err error) {
	if err != nil {
		fmt.Println("err:", err)
	}
}

func GetTime() string {
	const shortForm = "2006-01-02 15:04:05"
	t := time.Now()
	temp := time.Date(t.Year(), t.Month(), t.Day(), t.Hour(), t.Minute(), t.Second(), t.Nanosecond(), time.Local)
	str := temp.Format(shortForm)
	fmt.Println(t)
	return str
}

func GetMD5Hash(text string) string {
	haser := md5.New()
	haser.Write([]byte(text))
	return hex.EncodeToString(haser.Sum(nil))
}

func GetNowtimeMD5() string {
	t := time.Now()
	timestamp := strconv.FormatInt(t.UTC().UnixNano(), 10)
	return GetMD5Hash(timestamp)
}
func main() {
	opend, db := OpenDB()
	if opend {
		fmt.Println("open success")
	} else {
		fmt.Println("open faile:")
	}
	// DeleteFromDB(db, 10)
	QueryFromDB(db)
	//DeleteFromDB(db, 1)
	//UpdateDB(db, 5)
	//insertToDB(db)
	//UpdateUID(db, 5)
	//UpdateTime(db, 4)

}
