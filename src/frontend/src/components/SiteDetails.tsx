import { Mail, MapPin, Phone } from "lucide-react";
import {
  SiFacebook,
  SiInstagram,
  SiLinkedin,
  SiWhatsapp,
  SiX,
  SiYoutube,
} from "react-icons/si";
import { useGetSiteConfiguration } from "../hooks/useSiteConfiguration";

export default function SiteDetails() {
  const { data: config, isLoading } = useGetSiteConfiguration();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-muted rounded-lg" />
        <div className="h-20 bg-muted rounded-lg" />
        <div className="h-20 bg-muted rounded-lg" />
      </div>
    );
  }

  if (!config) return null;

  const contactItems = [
    { icon: MapPin, label: "Address", value: config.address },
    { icon: Phone, label: "Phone", value: config.phone },
    {
      icon: Mail,
      label: "Email",
      value: config.email,
      href: `mailto:${config.email}`,
    },
  ];

  const socialLinks = [
    {
      icon: SiFacebook,
      url: config.socialMedia.facebook,
      label: "Facebook",
      color: "hover:text-[#1877F2]",
    },
    {
      icon: SiX,
      url: config.socialMedia.twitter,
      label: "X",
      color: "hover:text-foreground",
    },
    {
      icon: SiInstagram,
      url: config.socialMedia.instagram,
      label: "Instagram",
      color: "hover:text-[#E4405F]",
    },
    {
      icon: SiLinkedin,
      url: config.socialMedia.linkedin,
      label: "LinkedIn",
      color: "hover:text-[#0A66C2]",
    },
    {
      icon: SiYoutube,
      url: config.socialMedia.youtube,
      label: "YouTube",
      color: "hover:text-[#FF0000]",
    },
    {
      icon: SiWhatsapp,
      url: config.socialMedia.whatsapp,
      label: "WhatsApp",
      color: "hover:text-[#25D366]",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Get in Touch</h3>
        <div className="space-y-3">
          {contactItems.map(
            (item) =>
              item.value && (
                <div
                  key={item.label}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors duration-300"
                >
                  <item.icon className="h-5 w-5 text-chart-1 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground font-medium">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-sm hover:text-chart-1 transition-colors break-words"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm break-words">{item.value}</p>
                    )}
                  </div>
                </div>
              ),
          )}
        </div>
      </div>

      {/* Social Media */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Connect With Us</h3>
        <div className="flex gap-4">
          {socialLinks.map(
            (social) =>
              social.url && (
                <a
                  key={social.label}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-3 rounded-lg bg-muted/50 hover:bg-muted transition-all duration-300 hover:scale-110 ${social.color}`}
                  aria-label={social.label}
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ),
          )}
        </div>
      </div>
    </div>
  );
}
