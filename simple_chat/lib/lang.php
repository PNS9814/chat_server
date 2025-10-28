<?php

class Lang
{
    const langs = [
        'ja' => ['label' => '日本語', 'voice' => "bqpOyYNUu11tjjvRUbKn"],
        'en' => ['label' => 'English - 英語', 'voice' => "21m00Tcm4TlvDq8ikWAM"],
        'es' => ['label' => 'Español - スペイン語', 'voice' => ""],
        'de' => ['label' => 'Deutsch - ドイツ語', 'voice' => ""],
        'fr' => ['label' => 'Français - フランス語', 'voice' => "kwhMCf63M8O3rCfnQ3oQ"],
        'bn' => ['label' => 'বাংলা - ベンガル語', 'voice' => "WiaIVvI1gDL4vT4y7qUU"],
        'zh' => ['label' => '中文 - 中国語', 'voice' => ""],
        'vi' => ['label' => 'Tiếng Việt - ベトナム語', 'voice' => ""],
        'bn' => ['label' => 'বাংলা - ベンガル語', 'voice' => "WiaIVvI1gDL4vT4y7qUU"],
        'si' => ['label' => 'සිංහල - シンハラ語', 'voice' => ""],
        'id' => ['label' => 'Bahasa Indonesia - インドネシア語', 'voice' => "4h05pJAlcSqTMs5KRd8X"],
        'ne' => ['label' => 'नेपाली - ネパール語', 'voice' => ""],
        'mn' => ['label' => 'Монгол - モンゴル語', 'voice' => ""],
        'my' => ['label' => 'မြန်မာ - ミャンマー語', 'voice' => ""],
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
