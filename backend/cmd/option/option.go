package option

import (
	"flag"
	"fmt"

	"github.com/spf13/viper"
)

type ConfigOption struct {
	Log struct {
		Mode        uint   `mapstructure:"mode"`
		LogFileName string `mapstructure:"fileName"`
		MaxSize     int    `mapstructure:"maxSize"`
		Level       string `mapstructure:"level"`
	} `mapstructure:"log"`
	HttpServer struct {
		Port int `mapstructure:"port"`
	} `mapstructure:"httpServer"`
	TransAIServiceConfig struct {
		BaseURL string `toml:"baseURL"`
	} `mapstructure:"transAIServiceConfig"`
	TransAIAppIdConfigs map[string]struct {
		AppId        string `toml:"appId"`
		AppCert      string `toml:"appCert"`
		AuthUsername string `toml:"authUsername"`
		AuthPassword string `toml:"authPassword"`
	} `mapstructure:"transAIAppIdConfigs"`
}

func NewCmdOption() (*ConfigOption, error) {
	var o ConfigOption
	folder := flag.String("folder", "./configs/", "config file folder")
	flag.Parse()

	viper.SetConfigName("config")
	viper.SetConfigType("toml")
	viper.AddConfigPath(*folder)
	if err := viper.ReadInConfig(); err != nil {
		return nil, fmt.Errorf("read config file error:%w", err)
	}
	if err := viper.Unmarshal(&o); err != nil {
		return nil, err
	}
	return &o, nil
}
