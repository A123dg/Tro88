import { Card, Flex, Image, Button } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

interface ImageManagerProps {
  urls: string[]
  onRemove: (url: string) => void
}

export function ImageManager({ urls, onRemove }: ImageManagerProps) {
  if (!urls || urls.length === 0) return null

  return (
    <Card size="small" title="Hình ảnh hiện tại" style={{ borderRadius: '12px', marginBottom: '16px' }}>
      <Flex gap="12px" wrap="wrap">
        {urls.map((url) => (
          <Card
            key={url}
            hoverable
            style={{ width: 104, borderRadius: '8px', overflow: 'hidden' }}
            styles={{ body: { padding: 0 } }}
          >
            <Flex vertical align="center" justify="center" style={{ position: 'relative', height: 104 }}>
              <Image
                src={url}
                alt="House image"
                width="100%"
                height="100%"
                style={{ objectFit: 'cover' }}
                preview={{ mask: 'Xem ảnh' }}
              />
              <Button
                type="primary"
                danger
                shape="circle"
                size="small"
                icon={<CloseOutlined />}
                onClick={() => onRemove(url)}
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 22,
                  height: 22,
                  minWidth: 22,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                }}
              />
            </Flex>
          </Card>
        ))}
      </Flex>
    </Card>
  )
}
