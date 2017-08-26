# Unicode Emojis on Raspberry Pi

By default, if you try to view the Play-Play app in Chome on a Raspberry Pi it
will fail to display most of the Unicode emojis. (Current Raspian version at
the time of writing is Stretch.)

Turns out to be a known issue in Debian:
https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=849042

Fortunatly the thread offer a workaround:
https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=849042#5

> Emoji are an extremely common form of expression in modern
> communication, yet the present options for displaying them in Debian are
> hacky at best. For example, this effort
> https://github.com/googlei18n/noto-emoji will display emoji correctly in
> Firefox but will only be black-and-white system-wide (so not in Chrome).
> Similarly, ttf-ancient-fonts can be installed for very ugly, B&W emoji.
> 
> The best solution I've currently found is based on this post:
> http://stdio.tumblr.com/post/114082931782
> and involves: downloading NotoColorEmoji.ttf from the noto-fonts Android
> git repository, copying it to /usr/share/fonts/truetype/, and creating a
> /etc/fonts/conf.d/01-notoemoji.conf with the contents:
> 
> <?xml version="1.0"?>
> <!DOCTYPE fontconfig SYSTEM "fonts.dtd">
> <fontconfig>
> 
>   <match target="scan">
>     <test name="family">
>       <string>Noto Color Emoji</string>
>     </test>
>     <edit name="scalable" mode="assign">
>       <bool>true</bool>
>     </edit>
>   </match>
> 
> </fontconfig>

## Obtaining the font

The latest version can be found here:
https://github.com/googlei18n/noto-emoji/blob/master/fonts/NotoColorEmoji.ttf

Direct link for raw download:
https://github.com/googlei18n/noto-emoji/blob/master/fonts/NotoColorEmoji.ttf?raw=true

Download the font into `/usr/share/fonts/truetype/` and create
`/etc/fonts/conf.d/01-notoemoji.conf` with the content quoted above.

Now Chrome on Raspberry Pi should be able to display the emoji unicode symbols.
