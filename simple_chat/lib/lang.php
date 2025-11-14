<?php

class Lang
{
    const langs = [
        'ja' => ['label' => '日本語', 'lang' => "ja-JP", 'voice' => "bqpOyYNUu11tjjvRUbKn"],
        'en' => ['label' => 'English - 英語', 'lang' => "en-US", 'voice' => "21m00Tcm4TlvDq8ikWAM"],
        'es' => ['label' => 'Español - スペイン語', 'lang' => "es-ES", 'voice' => ""],
        'de' => ['label' => 'Deutsch - ドイツ語', 'lang' => "de-DE", 'voice' => ""],
        'fr' => ['label' => 'Français - フランス語', 'lang' => "fr-FR", 'voice' => "kwhMCf63M8O3rCfnQ3oQ"],
        'bn' => ['label' => 'বাংলা - ベンガル語', 'lang' => "bn-BD", 'voice' => "WiaIVvI1gDL4vT4y7qUU"],
        'zh' => ['label' => '中文 - 中国語', 'lang' => "zh-CN", 'voice' => ""],
        'vi' => ['label' => 'Tiếng Việt - ベトナム語', 'lang' => "vi-VN", 'voice' => ""],
        'bn' => ['label' => 'বাংলা - ベンガル語', 'lang' => "bn-BD", 'voice' => "WiaIVvI1gDL4vT4y7qUU"],
        'si' => ['label' => 'සිංහල - シンハラ語', 'lang' => "si-LK", 'voice' => ""],
        'id' => ['label' => 'Bahasa Indonesia - インドネシア語', 'lang' => "id-ID", 'voice' => "4h05pJAlcSqTMs5KRd8X"],
        'ne' => ['label' => 'नेपाली - ネパール語', 'lang' => "ne-NP", 'voice' => ""],
        'mn' => ['label' => 'Монгол - モンゴル語', 'lang' => "mn-MN", 'voice' => ""],
        'my' => ['label' => 'မြန်မာ - ミャンマー語', 'lang' => "my-MM", 'voice' => ""],
    ];

    public static function getLangInfo($code)
    {
        $countryMap = [
            'ja' => 'JP',
            'en' => 'US',
            'es' => 'ES',
            'fr' => 'FR',
            'de' => 'DE',
            'zh' => 'CN',
            'vi' => 'VN',
            'bn' => 'BD',
            'si' => 'LK',
            'id' => 'ID',
            'ne' => 'NP',
            'mn' => 'MN',
            'my' => 'MM',
        ];

        return [
            'label' => self::langs[$code] ?? '',
            'lang_code' => $code . '-' . $countryMap[$code],
        ];
    }
}
