package main

import (
	"fmt"
	"github.com/SherClockHolmes/webpush-go"
)

func main() {
	privateKey, publicKey, err := webpush.GenerateVAPIDKeys()
	if err != nil {
		panic(err)
	}
	fmt.Printf("Private: %s\nPublic: %s\n", privateKey, publicKey)
}