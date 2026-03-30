interface JsonLdProps {
  type: 'article' | 'website' | 'person'
  data: {
    title?: string
    description?: string
    url?: string
    image?: string
    datePublished?: string
    dateModified?: string
    author?: string
    keywords?: string[]
  }
}

export default function JsonLd({ type, data }: JsonLdProps) {
  const baseUrl = 'https://haerin.haikari.top'

  const getJsonLd = () => {
    switch (type) {
      case 'article':
        return {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: data.title,
          description: data.description,
          url: `${baseUrl}${data.url}`,
          datePublished: data.datePublished,
          dateModified: data.dateModified || data.datePublished,
          author: {
            '@type': 'Person',
            name: data.author || 'Haerin',
          },
          publisher: {
            '@type': 'Organization',
            name: 'Haerin Blog',
            logo: {
              '@type': 'ImageObject',
              url: `${baseUrl}/logo.png`,
            },
          },
          keywords: data.keywords?.join(', '),
        }

      case 'website':
        return {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Haerin Blog',
          description: data.description,
          url: baseUrl,
          author: {
            '@type': 'Person',
            name: 'Haerin',
          },
        }

      case 'person':
        return {
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: 'Haerin',
          url: baseUrl,
          description: data.description,
        }

      default:
        return {}
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(getJsonLd()) }}
    />
  )
}
