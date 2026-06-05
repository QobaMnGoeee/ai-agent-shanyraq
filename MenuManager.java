package kz.nova.clans.managers;

import kz.nova.clans.NovaClans;
import kz.nova.clans.data.ClanData;
import kz.nova.clans.data.ClanMember;
import kz.nova.clans.data.ClanRole;
import net.kyori.adventure.text.Component;
import org.bukkit.Bukkit;
import org.bukkit.Material;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.configuration.file.YamlConfiguration;
import org.bukkit.entity.Player;
import org.bukkit.inventory.Inventory;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;

import java.io.File;
import java.util.*;

public class MenuManager {

    private final NovaClans plugin;
    private YamlConfiguration clanMenuConfig;
    private YamlConfiguration storageMenuConfig;

    private final Map<UUID, String> openStorageMenu = new HashMap<>();

    public MenuManager(NovaClans plugin) {
        this.plugin = plugin;
        reload();
    }

    public void reload() {
        File menuDir = new File(plugin.getDataFolder(), "menus");
        if (!menuDir.exists()) menuDir.mkdirs();

        File clanMenuFile = new File(menuDir, "clan_menu.yml");
        File storageMenuFile = new File(menuDir, "storage_menu.yml");

        if (!clanMenuFile.exists()) plugin.saveResource("menus/clan_menu.yml", false);
        if (!storageMenuFile.exists()) plugin.saveResource("menus/storage_menu.yml", false);

        clanMenuConfig = YamlConfiguration.loadConfiguration(clanMenuFile);
        storageMenuConfig = YamlConfiguration.loadConfiguration(storageMenuFile);
    }

    // ─── /clan main menu ─────────────────────────────────────────────────────

    public void openMainMenu(Player player) {
        boolean inClan = plugin.getDataManager().isInClan(player.getUniqueId());
        if (!inClan) {
            openNoClanMenu(player);
        } else {
            openClanMenu(player, plugin.getDataManager().getClanByPlayer(player.getUniqueId()));
        }
    }

    private void openNoClanMenu(Player player) {
        ConfigurationSection cfg = clanMenuConfig.getConfigurationSection("no-clan-menu");
        if (cfg == null) return;

        int rows = cfg.getInt("rows", 3);
        String titleRaw = cfg.getString("title", "<gray>Клан Мәзірі");
        Component title = parseTitle(titleRaw);
        Inventory inv = Bukkit.createInventory(null, rows * 9, title);

        fillItems(inv, cfg, player, null);
        player.openInventory(inv);
    }

    private void openClanMenu(Player player, ClanData clan) {
        ConfigurationSection cfg = clanMenuConfig.getConfigurationSection("clan-menu");
        if (cfg == null) return;

        int rows = cfg.getInt("rows", 4);
        String titleRaw = applyPlaceholders(cfg.getString("title", "<gray>Клан"), player, clan);
        Component title = parseTitle(titleRaw);
        Inventory inv = Bukkit.createInventory(null, rows * 9, title);

        fillItems(inv, cfg, player, clan);
        player.openInventory(inv);
    }

    /**
     * Fill items from config section "items". NO automatic glass pane filler.
     * Admins fully control every slot via config.
     */
    private void fillItems(Inventory inv, ConfigurationSection cfg, Player player, ClanData clan) {
        ConfigurationSection items = cfg.getConfigurationSection("items");
        if (items == null) return;
        for (String key : items.getKeys(false)) {
            ConfigurationSection ic = items.getConfigurationSection(key);
            if (ic == null) continue;
            // Support single slot or slots list
            List<Integer> slots = getSlots(ic);
            ItemStack item = buildItemFromSection(ic, player, clan);
            for (int slot : slots) {
                if (slot >= 0 && slot < inv.getSize()) inv.setItem(slot, item);
            }
        }
    }

    private List<Integer> getSlots(ConfigurationSection ic) {
        List<Integer> result = new ArrayList<>();
        if (ic.isList("slots")) {
            for (int s : ic.getIntegerList("slots")) result.add(s);
        } else if (ic.contains("slot")) {
            result.add(ic.getInt("slot", 0));
        }
        return result;
    }

    // ─── Storage info menu ───────────────────────────────────────────────────

    public void openStorageInfoMenu(Player player) {
        ClanData clan = plugin.getDataManager().getClanByPlayer(player.getUniqueId());
        if (clan == null) { plugin.getMessageManager().send(player, "not-in-clan"); return; }

        ConfigurationSection cfg = storageMenuConfig.getConfigurationSection("storage-menu");
        if (cfg == null) return;

        int rows = cfg.getInt("rows", 5);
        String titleRaw = applyPlaceholders(cfg.getString("title", "<gray>Клан Қоймасы"), player, clan);
        Component title = parseTitle(titleRaw);
        int size = rows * 9;
        Inventory inv = Bukkit.createInventory(null, size, title);

        fillItems(inv, cfg, player, clan);

        openStorageMenu.put(player.getUniqueId(), clan.getName() + ":info");
        player.openInventory(inv);
    }

    // ─── Clan vault ──────────────────────────────────────────────────────────

    public void openClanVault(Player player) {
        ClanData clan = plugin.getDataManager().getClanByPlayer(player.getUniqueId());
        if (clan == null) { plugin.getMessageManager().send(player, "not-in-clan"); return; }
        openVaultForClan(player, clan);
    }

    public void openAdminVault(Player player, ClanData clan) {
        openVaultForClan(player, clan);
    }

    private void openVaultForClan(Player player, ClanData clan) {
        int slots = plugin.getConfig().getInt("storage.level-" + clan.getLevel(), 27);
        String titleStr = "<dark_gray>[<#ffc800>Клан Қоймасы<dark_gray>] <#ffc800>" + clan.getName()
                + " <gray>| <aqua>Lv." + clan.getLevel();
        Component title = MessageManager.parse(titleStr);
        Inventory inv = Bukkit.createInventory(null, slots, title);

        ItemStack[] contents = clan.getStorageContents();
        if (contents != null) {
            for (int i = 0; i < Math.min(contents.length, slots); i++) {
                if (contents[i] != null) inv.setItem(i, contents[i]);
            }
        }

        openStorageMenu.put(player.getUniqueId(), clan.getName() + ":vault");
        player.openInventory(inv);
    }

    public void saveVaultAndClose(Player player, Inventory inv) {
        String entry = openStorageMenu.remove(player.getUniqueId());
        if (entry == null || !entry.endsWith(":vault")) return;
        String clanName = entry.replace(":vault", "");
        ClanData clan = plugin.getDataManager().getClan(clanName);
        if (clan == null) return;
        clan.setStorageContents(inv.getContents());
        plugin.getDataManager().save();
    }

    public boolean isInStorageVault(UUID uuid) {
        String e = openStorageMenu.get(uuid);
        return e != null && e.endsWith(":vault");
    }

    public boolean isInStorageInfo(UUID uuid) {
        String e = openStorageMenu.get(uuid);
        return e != null && e.endsWith(":info");
    }

    public void removeFromStorageTracking(UUID uuid) {
        openStorageMenu.remove(uuid);
    }

    // ─── Members menu ────────────────────────────────────────────────────────

    public void openMembersMenu(Player player) {
        ClanData clan = plugin.getDataManager().getClanByPlayer(player.getUniqueId());
        if (clan == null) return;

        int size = 54;
        String titleStr = "<dark_gray>[<#ffc800>Мүшелер<dark_gray>] <#ffc800>" + clan.getName();
        Component title = MessageManager.parse(titleStr);
        Inventory inv = Bukkit.createInventory(null, size, title);

        // Back button at 49
        inv.setItem(49, buildItem(Material.ARROW,
                "<gradient:#ffc800:#f2990a><bold>← Кері</bold></gradient>",
                List.of("<#ffc800>Артқа қайту"), false));

        int slot = 0;
        for (Map.Entry<UUID, ClanMember> entry : clan.getMembers().entrySet()) {
            if (slot >= 45) break;
            ClanMember member = entry.getValue();
            String roleColor = getRoleColorMM(member.getRole());
            String roleIcon = getRoleIcon(member.getRole());

            ItemStack head = new ItemStack(Material.PLAYER_HEAD);
            ItemMeta meta = head.getItemMeta();
            if (meta instanceof org.bukkit.inventory.meta.SkullMeta skullMeta) {
                skullMeta.setOwningPlayer(Bukkit.getOfflinePlayer(entry.getKey()));
                meta = skullMeta;
            }
            meta.displayName(MessageManager.parse(
                    "<gradient:#ffc800:#f2990a><bold>" + roleIcon + " " + member.getName() + "</bold></gradient>"));
            boolean online = Bukkit.getPlayer(entry.getKey()) != null;
            meta.lore(List.of(
                    MessageManager.parse("<#ffc800>Рөл: " + roleColor + member.getRole().getDisplayName()),
                    MessageManager.parse("<#ffc800>Онлайн: " + (online ? "<green>Иә" : "<red>Жоқ"))
            ));
            head.setItemMeta(meta);
            inv.setItem(slot++, head);
        }

        player.openInventory(inv);
    }

    // ─── Top clans menu ──────────────────────────────────────────────────────

    public void openTopMenu(Player player) {
        List<ClanData> top = plugin.getDataManager().getTopClans(10);
        int size = 54;
        String titleStr = "<gray>Клан Топ-10";
        Component title = MessageManager.parse(titleStr);
        Inventory inv = Bukkit.createInventory(null, size, title);

        int[] slots = {10, 11, 12, 13, 14, 15, 16, 28, 31, 34};
        Material[] medals = {
                Material.GOLD_INGOT, Material.IRON_INGOT, Material.COPPER_INGOT,
                Material.EMERALD, Material.DIAMOND, Material.AMETHYST_SHARD,
                Material.LAPIS_LAZULI, Material.REDSTONE, Material.QUARTZ, Material.COAL
        };

        for (int i = 0; i < Math.min(top.size(), 10); i++) {
            ClanData clan = top.get(i);
            String rankPrefix = i == 0 ? "<gold>" : i == 1 ? "<gray>" : i == 2 ? "<red>" : "<white>";
            List<String> lore = List.of(
                    "<#ffc800>Деңгей: <#f0e173>" + clan.getLevel(),
                    "<#ffc800>Ұпай: <#f0e173>" + clan.getPoints(),
                    "<#ffc800>Баланс: <#f0e173>" + plugin.getClanManager().formatMoney(clan.getBalance()) + "₸",
                    "<#ffc800>Мүшелер: <#f0e173>" + clan.getMemberCount()
            );
            ItemStack item = buildItem(medals[i],
                    "<gradient:#ffc800:#f2990a><bold>#" + (i + 1) + " " + clan.getName() + "</bold></gradient>",
                    lore, i < 3);
            if (i < slots.length) inv.setItem(slots[i], item);
        }
        player.openInventory(inv);
    }

    // ─── Quest menu ──────────────────────────────────────────────────────────

    public void openQuestMenu(Player player) {
        ClanData clan = plugin.getDataManager().getClanByPlayer(player.getUniqueId());
        if (clan == null) { plugin.getMessageManager().send(player, "not-in-clan"); return; }

        int size = 36;
        String titleStr = "<gray>Квесттер";
        Component title = MessageManager.parse(titleStr);
        Inventory inv = Bukkit.createInventory(null, size, title);

        int maxLevel = plugin.getConfig().getInt("max-level", 5);
        long currentPoints = clan.getPoints();
        int currentLevel = clan.getLevel();

        long nextRequired = currentLevel < maxLevel
                ? plugin.getConfig().getLong("levels." + (currentLevel + 1), 0)
                : plugin.getConfig().getLong("levels." + maxLevel, 0);
        long prevRequired = plugin.getConfig().getLong("levels." + currentLevel, 0);
        String progressBar = buildProgressBar(currentPoints - prevRequired, nextRequired - prevRequired, 20);

        List<String> progressLore = new ArrayList<>();
        progressLore.add("<#ffc800>Деңгей: <#f0e173>" + currentLevel + " <#ffc800>/ <#f0e173>" + maxLevel);
        progressLore.add("<#ffc800>Ұпай: <#f0e173>" + currentPoints + " <#ffc800>/ <#f0e173>" + nextRequired);
        progressLore.add(progressBar);
        progressLore.add("<#ffc800>Ұпай жинау жолдары:");
        progressLore.add("<#ffc800>⚔ Ойыншы өлтіру: <#f0e173>+2 ұпай");
        progressLore.add("<#ffc800>☠ Моб өлтіру: <#f0e173>+1 ұпай");

        inv.setItem(13, buildItem(Material.EXPERIENCE_BOTTLE,
                "<gradient:#ffc800:#f2990a><bold>✦ Клан Прогресі</bold></gradient>",
                progressLore, false));

        int[] levelSlots = {19, 21, 23, 25, 27};
        for (int lv = 1; lv <= maxLevel; lv++) {
            long req = plugin.getConfig().getLong("levels." + lv, 0);
            boolean achieved = currentLevel >= lv;
            Material mat = achieved ? Material.LIME_STAINED_GLASS_PANE : Material.RED_STAINED_GLASS_PANE;
            String status = achieved ? "<green>✔ Жетілді" : "<red>✘ Жетілмеді";
            if (lv - 1 < levelSlots.length) {
                inv.setItem(levelSlots[lv - 1], buildItem(mat,
                        "<gradient:#ffc800:#f2990a><bold>⭐ Деңгей " + lv + "</bold></gradient>",
                        List.of("<#ffc800>Керекті ұпай: <#f0e173>" + req, status), false));
            }
        }

        player.openInventory(inv);
    }

    // ─── Item builders ───────────────────────────────────────────────────────

    private ItemStack buildItemFromSection(ConfigurationSection sec, Player player, ClanData clan) {
        Material mat = parseMaterial(sec.getString("material", "STONE"));
        String nameRaw = applyPlaceholders(sec.getString("name", ""), player, clan);
        List<String> loreRaw = sec.getStringList("lore").stream()
                .map(l -> applyPlaceholders(l, player, clan))
                .toList();
        boolean enchanted = sec.getBoolean("enchanted", false);
        return buildItem(mat, nameRaw, loreRaw, enchanted);
    }

    /**
     * Build an ItemStack. name and lore strings support MiniMessage + legacy & codes.
     * - display_name: BOLD + gradient #ffc800 -> #f2990a (unless it's already a MiniMessage string)
     * - lore lines: #ffc800 color, no bold; placeholder values in #f0e173
     */
    private ItemStack buildItem(Material mat, String name, List<String> lore, boolean enchanted) {
        ItemStack item = new ItemStack(mat);
        ItemMeta meta = item.getItemMeta();
        if (meta == null) return item;

        if (name != null && !name.isEmpty()) {
            // If name doesn't already have a gradient/color tag, wrap with gradient+bold
            String finalName = ensureItemNameStyle(name);
            meta.displayName(MessageManager.parse(finalName));
        }

        if (lore != null && !lore.isEmpty()) {
            List<Component> loreComponents = lore.stream()
                    .map(line -> MessageManager.parse(ensureLoreStyle(line)))
                    .toList();
            meta.lore(loreComponents);
        }

        if (enchanted) {
            meta.addEnchant(org.bukkit.enchantments.Enchantment.UNBREAKING, 1, true);
            meta.addItemFlags(org.bukkit.inventory.ItemFlag.HIDE_ENCHANTS);
        }
        item.setItemMeta(meta);
        return item;
    }

    /**
     * Ensure display name has bold + gold gradient unless it already has MiniMessage tags
     */
    private String ensureItemNameStyle(String name) {
        if (name.contains("<gradient") || name.contains("<bold") || name.contains("<#")) {
            return name; // already styled
        }
        // Remove any legacy &l bold since we're adding it via MM
        String cleaned = name.replaceAll("&l", "").replaceAll("§l", "");
        return "<gradient:#ffc800:#f2990a><bold>" + cleaned + "</bold></gradient>";
    }

    /**
     * Ensure lore line has #ffc800 base color, no bold.
     * Placeholder values (%...% or numbers adjacent to certain patterns) get #f0e173.
     */
    private String ensureLoreStyle(String line) {
        if (line.isEmpty()) return line;
        if (line.contains("<gradient") || line.contains("<#") || line.contains("§")) {
            return line; // already styled by config
        }
        // Strip legacy color codes that were pre-applied
        String stripped = line.replaceAll("&[0-9a-fA-Fk-oK-OrR]", "");
        // Wrap placeholder values in #f0e173
        // Simple heuristic: after colon+space, if there's a number or %placeholder%
        stripped = stripped.replaceAll("(:\\s*)([0-9,\\.₸%]+)", "$1<#f0e173>$2<#ffc800>");
        stripped = stripped.replaceAll("(%[^%]+%)", "<#f0e173>$1<#ffc800>");
        return "<#ffc800>" + stripped;
    }

    // ─── Progress bar ────────────────────────────────────────────────────────

    private String buildProgressBar(long current, long max, int length) {
        if (max <= 0) return "<green>" + "█".repeat(length);
        double ratio = Math.min(1.0, (double) current / max);
        int filled = (int) (ratio * length);
        return "<green>" + "█".repeat(filled) + "<dark_gray>" + "█".repeat(length - filled)
                + " <gray>(" + String.format("%.1f", ratio * 100) + "%)";
    }

    // ─── Placeholders ────────────────────────────────────────────────────────

    private String applyPlaceholders(String text, Player player, ClanData clan) {
        if (text == null) return "";
        if (clan != null) {
            ClanRole role = clan.getMemberRole(player.getUniqueId());
            text = text
                    .replace("%nova_clan_name%", clan.getName())
                    .replace("%nova_clan_level%", String.valueOf(clan.getLevel()))
                    .replace("%nova_clan_points%", String.valueOf(clan.getPoints()))
                    .replace("%nova_clan_balance%", plugin.getClanManager().formatMoney(clan.getBalance()))
                    .replace("%nova_clan_role%", role != null ? role.getDisplayName() : "Жоқ");
        } else {
            text = text
                    .replace("%nova_clan_name%", "Жоқ")
                    .replace("%nova_clan_level%", "0")
                    .replace("%nova_clan_points%", "0")
                    .replace("%nova_clan_balance%", "0")
                    .replace("%nova_clan_role%", "Жоқ");
        }
        return text;
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private String getRoleColorMM(ClanRole role) {
        return switch (role) {
            case LEADER -> "<red>";
            case DEPUTY -> "<yellow>";
            case MEMBER -> "<gray>";
        };
    }

    private String getRoleIcon(ClanRole role) {
        return switch (role) {
            case LEADER -> "★";
            case DEPUTY -> "✦";
            case MEMBER -> "•";
        };
    }

    /**
     * Parse a title string. Titles use &7 (gray) — no bold.
     */
    private Component parseTitle(String raw) {
        if (raw == null) return Component.empty();
        // Ensure title has &7 color if no color specified
        if (!raw.startsWith("&") && !raw.startsWith("<") && !raw.startsWith("§")) {
            raw = "&7" + raw;
        }
        return MessageManager.parse(raw);
    }

    private Material parseMaterial(String name) {
        if (name == null) return Material.STONE;
        try { return Material.valueOf(name.toUpperCase()); }
        catch (IllegalArgumentException e) { return Material.STONE; }
    }
    public void handleStorageInfoSlotClick(Player player, int slot) {
        // Read action from storage_menu config items by matching slot
        ConfigurationSection cfg = storageMenuConfig.getConfigurationSection("storage-menu");
        if (cfg == null) return;

        ConfigurationSection items = cfg.getConfigurationSection("items");
        if (items == null) {
            // Legacy fallback: fixed slots
            switch (slot) {
                case 37 -> {} // info - no action
                case 38 -> {} // quest - no action
                case 40 -> { player.closeInventory(); openMembersMenu(player); }
                case 41 -> { player.closeInventory(); openClanVault(player); }
            }
            return;
        }

        for (String key : items.getKeys(false)) {
            ConfigurationSection ic = items.getConfigurationSection(key);
            if (ic == null) continue;
            List<Integer> slots = getSlots(ic);
            if (!slots.contains(slot)) continue;
            String action = ic.getString("action", "NONE");
            executeAction(player, action);
            return;
        }
    }

    private void executeAction(Player player, String action) {
        if (action == null) return;
        switch (action.toUpperCase()) {
            case "OPEN_STORAGE", "OPEN_STORAGE_INFO" -> { player.closeInventory(); openStorageInfoMenu(player); }
            case "OPEN_VAULT" -> { player.closeInventory(); openClanVault(player); }
            case "OPEN_QUESTS" -> { player.closeInventory(); openQuestMenu(player); }
            case "OPEN_TOP" -> { player.closeInventory(); openTopMenu(player); }
            case "OPEN_MEMBERS" -> { player.closeInventory(); openMembersMenu(player); }
            case "OPEN_MAIN", "BACK" -> { player.closeInventory(); openMainMenu(player); }
            case "OPEN_CREATE_CHAT" -> {
                player.closeInventory();
                plugin.getMessageManager().sendRaw(player,
                        "&8[&eᴄʟᴀɴ&8] &r<#ffc800>Клан атын чатқа теріңіз немесе <#f0e173>/clan create <ат>");
            }
            default -> {} // NONE or unknown
        }
    }

    public void handleMainMenuSlotClick(Player player, int slot, String title) {
        // Determine which menu config to use based on title
        ConfigurationSection cfg = null;
        boolean inClan = plugin.getDataManager().isInClan(player.getUniqueId());
        if (inClan) {
            cfg = clanMenuConfig.getConfigurationSection("clan-menu");
        } else {
            cfg = clanMenuConfig.getConfigurationSection("no-clan-menu");
        }
        if (cfg == null) return;

        ConfigurationSection items = cfg.getConfigurationSection("items");
        if (items == null) return;

        for (String key : items.getKeys(false)) {
            ConfigurationSection ic = items.getConfigurationSection(key);
            if (ic == null) continue;
            List<Integer> slots = getSlots(ic);
            if (!slots.contains(slot)) continue;
            String action = ic.getString("action", "NONE");
            executeAction(player, action);
            return;
        }
    }
}
