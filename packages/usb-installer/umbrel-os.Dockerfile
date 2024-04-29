FROM debian:bookworm-slim

RUN echo "root:root" | chpasswd

RUN apt-get -y update

# Install Linux kernel, systemd and bootloader
RUN apt-get install --yes --no-install-recommends linux-image-amd64 systemd-sysv systemd-boot xz-utils

# We can't install the bootloader via `bootctl install` from Docker because it complains
# about an invalid ESP partition. We can't easily fix it with loopback mounts from a Docker
# build environment. Instead we just manually install the bootloader to /boot and 
# migrate /boot to an ESP partition in a post processing step outside of Docker.
RUN mkdir -p "/boot/EFI/systemd/"
RUN mkdir -p "/boot/EFI/BOOT/"
RUN cp "/usr/lib/systemd/boot/efi/systemd-bootx64.efi" "/boot/EFI/systemd/systemd-bootx64.efi"
RUN cp "/usr/lib/systemd/boot/efi/systemd-bootx64.efi" "/boot/EFI/BOOT/bootx64.efi"

# Generate boot config
RUN mkdir -p "/boot/loader/entries"

RUN echo " \n\
title   Debian \n\
linux   $(ls /boot/vmlinuz-* | sed 's/\/boot//') \n\
initrd  $(ls /boot/initrd.img* | sed 's/\/boot//') \n\
options root=LABEL=ROOTFS rw quiet loglevel=1" | tee "/boot/loader/entries/debian.conf"

RUN echo " \n\
default debian \n\
timeout 0 \n\
console-mode max \n\
editor no" | tee "/boot/loader/loader.conf"

# Verify boot status
RUN bootctl --esp-path=/boot status

RUN adduser --gecos "" --disabled-password umbrel
RUN echo "umbrel:umbrel" | chpasswd
RUN usermod -aG sudo umbrel

# Copy in filesystem overlay
COPY overlay /

RUN systemctl enable custom-tty.service
RUN systemctl mask console-getty.service
RUN systemctl mask getty@tty1.service