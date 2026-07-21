'use client';

import type { LibraryMaterialAssetDto, LibraryMaterialDto } from '@pkg/types';
import {
  FileText,
  Link2,
  Trash2,
  Video,
  Volume2,
} from 'lucide-react';
import { Badge, Button, SurfaceCard } from '../../components/ui';
import { useCampusT } from '../../lib/cms';
import {
  materialAssetPrimaryName,
  materialAssetSecondaryHint,
} from './material-asset-display';
import { MaterialAssetLink } from './MaterialAssetLink';
import { materialAssetPreviewHref, materialCoverImageHref } from './material-cover';
import { libraryKindMeta } from './material-kind-meta';
import { formatProficiencyLevelShort } from '../../lib/proficiency-level';
import styles from './MaterialCard.module.scss';

const KIND_I18N_KEY: Record<LibraryMaterialDto['kind'], string> = {
  board: 'materials.kind.board',
  presentation: 'materials.kind.presentation',
  book: 'materials.kind.book',
  other: 'materials.kind.other',
};

type Props = {
  material: LibraryMaterialDto;
  layout?: 'grid' | 'list';
  onEdit?: (material: LibraryMaterialDto) => void;
  onDelete?: (material: LibraryMaterialDto) => void;
  deleting?: boolean;
};

const LIST_ASSET_PREVIEW = 4;
const GRID_ASSET_PREVIEW = 3;
const GRID_TAG_PREVIEW = 3;

function kindMeta(kind: LibraryMaterialDto['kind']) {
  const meta = libraryKindMeta(kind);
  const toneClass: Record<typeof meta.tone, string> = {
    board: styles.toneBoard,
    presentation: styles.tonePresentation,
    book: styles.toneBook,
    other: styles.toneOther,
  };
  const badge: 'blue' | 'amber' | 'green' | 'neutral' =
    kind === 'board'
      ? 'blue'
      : kind === 'presentation'
        ? 'amber'
        : kind === 'book'
          ? 'green'
          : 'neutral';
  return { Icon: meta.Icon, tone: toneClass[meta.tone], badge };
}

function AssetIcon({ asset }: { asset: LibraryMaterialAssetDto }) {
  if (asset.role === 'audio') return <Volume2 size={14} aria-hidden />;
  if (asset.role === 'video') return <Video size={14} aria-hidden />;
  if (asset.deliveryKind === 'url') return <Link2 size={14} aria-hidden />;
  return <FileText size={14} aria-hidden />;
}

function MaterialAssetChip({ asset }: { asset: LibraryMaterialAssetDto }) {
  const name = materialAssetPrimaryName(asset);
  const title = materialAssetSecondaryHint(asset) ?? name;
  const previewHref = materialAssetPreviewHref(asset);
  const hasHref =
    (asset.deliveryKind === 'url' && asset.url) ||
    (asset.deliveryKind === 'file' && asset.downloadPath);

  const content = (
    <>
      {previewHref ? (
        <img src={previewHref} alt="" className={styles.assetChipThumb} />
      ) : (
        <AssetIcon asset={asset} />
      )}
      <span className={styles.assetChipLabel}>{name}</span>
    </>
  );

  if (!hasHref) {
    return (
      <span className={styles.assetChipMuted} title={title}>
        {content}
      </span>
    );
  }

  return (
    <MaterialAssetLink asset={asset} className={styles.assetChip} title={title}>
      {content}
    </MaterialAssetLink>
  );
}

function MaterialCardCover({
  material,
  tone,
  Icon,
}: {
  material: LibraryMaterialDto;
  tone: string;
  Icon: typeof FileText;
}) {
  const coverHref = materialCoverImageHref(material);

  if (coverHref) {
    return (
      <div className={[styles.coverWrap, tone].join(' ')}>
        <img src={coverHref} alt="" className={styles.coverImage} />
      </div>
    );
  }

  return (
    <div className={[styles.iconWrap, tone].join(' ')}>
      <Icon size={20} aria-hidden />
    </div>
  );
}

function MaterialCardActions({
  material,
  onEdit,
  onDelete,
  deleting,
}: Pick<Props, 'material' | 'onEdit' | 'onDelete' | 'deleting'>) {
  const t = useCampusT();
  return (
    <div className={styles.actions}>
      {onEdit ? (
        <Button
          type="button"
          variant="primary"
          className={styles.actionOpenBtn}
          onClick={() => onEdit(material)}
        >
          {t('materials.card.open')}
        </Button>
      ) : null}
      {onDelete ? (
        <Button
          type="button"
          variant="ghost"
          className={[styles.actionIconBtn, styles.actionIconBtnDanger].join(' ')}
          loading={deleting}
          loadingLabel={t('materials.card.deleting')}
          loadingAriaLabel={t('materials.card.deleteAria', { title: material.title })}
          onClick={() => onDelete(material)}
          aria-label={t('materials.card.deleteAria', { title: material.title })}
        >
          <Trash2 size={16} aria-hidden />
        </Button>
      ) : null}
    </div>
  );
}

function MaterialCardTags({ tags, layout }: { tags: string[]; layout: 'grid' | 'list' }) {
  if (tags.length === 0) return null;
  const limit = layout === 'grid' ? GRID_TAG_PREVIEW : 2;
  const visible = tags.slice(0, limit);
  const rest = tags.length - visible.length;

  return (
    <div className={styles.tags}>
      {visible.map((tag) => (
        <span key={tag} className={styles.tag}>
          {tag}
        </span>
      ))}
      {rest > 0 ? <span className={styles.tagMore}>+{rest}</span> : null}
    </div>
  );
}

function MaterialGridCard(props: Props) {
  const { material, onEdit, onDelete, deleting } = props;
  const t = useCampusT();
  const { Icon, tone, badge } = kindMeta(material.kind);
  const levelLabel = formatProficiencyLevelShort(material.level);
  const previewAssets = material.assets.slice(0, GRID_ASSET_PREVIEW);
  const hiddenAssets = material.assets.length - previewAssets.length;

  return (
    <SurfaceCard as="article" className={[styles.card, styles.cardGrid, tone].join(' ')}>
      <div className={styles.head}>
        <MaterialCardCover material={material} tone={tone} Icon={Icon} />
        <div className={styles.headText}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{material.title}</h3>
            <Badge variant={badge}>{t(KIND_I18N_KEY[material.kind])}</Badge>
          </div>
          <p className={styles.meta}>
            {levelLabel ? levelLabel : null}
            {levelLabel && material.publisher ? ' · ' : null}
            {material.publisher ? material.publisher : null}
            {!levelLabel && !material.publisher && material.assets.length > 0
              ? material.assets.length === 1
                ? t('materials.card.fileOne')
                : t('materials.card.fileMany', { count: material.assets.length })
              : null}
          </p>
        </div>
      </div>

      {material.description ? (
        <p className={styles.descriptionGrid}>{material.description}</p>
      ) : null}

      {material.assets.length > 0 ? (
        <div className={styles.gridAssets}>
          {previewAssets.map((asset) => (
            <MaterialAssetChip key={asset.id} asset={asset} />
          ))}
          {hiddenAssets > 0 ? (
            <span className={styles.assetChipMore}>
              {t('materials.card.moreAssets', { count: hiddenAssets })}
            </span>
          ) : null}
        </div>
      ) : null}

      <MaterialCardTags tags={material.tags} layout="grid" />

      <div className={styles.gridFooter}>
        <MaterialCardActions
          material={material}
          onEdit={onEdit}
          onDelete={onDelete}
          deleting={deleting}
        />
      </div>
    </SurfaceCard>
  );
}

function MaterialListCard(props: Props) {
  const { material, onEdit, onDelete, deleting } = props;
  const t = useCampusT();
  const { Icon, tone, badge } = kindMeta(material.kind);
  const levelLabel = formatProficiencyLevelShort(material.level);
  const previewAssets = material.assets.slice(0, LIST_ASSET_PREVIEW);
  const hiddenAssets = material.assets.length - previewAssets.length;

  return (
    <SurfaceCard as="article" className={[styles.card, styles.cardList, tone].join(' ')}>
      <div className={styles.listRow}>
        <MaterialCardCover material={material} tone={tone} Icon={Icon} />

        <div className={styles.listMain}>
          <div className={styles.listHeadline}>
            <div className={styles.listTitleBlock}>
              <h3 className={styles.title}>{material.title}</h3>
              <p className={styles.listMeta}>
                <Badge variant={badge}>{t(KIND_I18N_KEY[material.kind])}</Badge>
                {levelLabel ? <span>{levelLabel}</span> : null}
                {material.publisher ? <span>{material.publisher}</span> : null}
                {material.assets.length > 0 ? (
                  <span>
                    {material.assets.length === 1
                      ? t('materials.card.fileOne')
                      : t('materials.card.fileMany', { count: material.assets.length })}
                  </span>
                ) : null}
              </p>
            </div>
            <MaterialCardActions
              material={material}
              onEdit={onEdit}
              onDelete={onDelete}
              deleting={deleting}
            />
          </div>

          {material.description ? (
            <p className={styles.descriptionList}>{material.description}</p>
          ) : null}

          {material.assets.length > 0 ? (
            <div className={styles.listAssets}>
              {previewAssets.map((asset) => (
                <MaterialAssetChip key={asset.id} asset={asset} />
              ))}
              {hiddenAssets > 0 ? (
                <span className={styles.assetChipMore}>
              {t('materials.card.moreAssets', { count: hiddenAssets })}
            </span>
              ) : null}
            </div>
          ) : null}

          <MaterialCardTags tags={material.tags} layout="list" />
        </div>
      </div>
    </SurfaceCard>
  );
}

export function MaterialCard({ layout = 'grid', ...props }: Props) {
  if (layout === 'list') {
    return <MaterialListCard layout={layout} {...props} />;
  }
  return <MaterialGridCard layout={layout} {...props} />;
}
