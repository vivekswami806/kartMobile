import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";
import type { Address } from "@/types";
import { Loading, Message, Page, palette } from "@/components/ui";
import { lightTheme } from "./styles/light";

const ADDRESS_TYPES = [
  {
    label: "Home",
    icon: "home-outline" as const,
  },
  {
    label: "Work",
    icon: "briefcase-outline" as const,
  },
  {
    label: "Other",
    icon: "location-outline" as const,
  },
];

export default function AddressesScreen() {
  const { user, isReady } = useAuthStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [label, setLabel] = useState("Home");
  const [line1, setLine1] = useState("");
  const [street, setStreet] = useState("");
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Jharkhand");
  const [instructions, setInstructions] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await api.addresses();
      setAddresses(result.addresses);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not load addresses"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isReady) return;

    if (!user) {
      setLoading(false);
      return;
    }

    void load();
  }, [isReady, user, load]);

  const clearForm = () => {
    setLine1("");
    setStreet("");
    setPincode("");
    setCity("");
    setInstructions("");
  };

  const save = async () => {
    setBusy(true);
    setError("");

    try {
      await api.createAddress({
        label,
        line1: line1.trim(),
        street: street.trim(),
        pincode: pincode.trim(),
        city: city.trim(),
        state: state.trim(),
        instructions: instructions.trim(),
      });

      clearForm();
      await load();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not save address"
      );
    } finally {
      setBusy(false);
    }
  };

  const mutate = async (work: () => Promise<unknown>) => {
    setBusy(true);
    setError("");

    try {
      await work();
      await load();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not update address"
      );
    } finally {
      setBusy(false);
    }
  };

  const isFormValid =
    line1.trim().length > 0 &&
    pincode.trim().length >= 4 &&
    city.trim().length > 0 &&
    state.trim().length > 0;

  if (!isReady) {
    return (
      <Page title="">
        <Loading />
      </Page>
    );
  }

  if (!user) {
    return (
      <Page title="">
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="location-outline"
              size={34}
              color={palette.accent}
            />
          </View>

          <Text style={styles.emptyTitle}>
            Sign in to manage addresses
          </Text>

          <Text style={styles.emptyText}>
            Save your home, work, and other delivery locations
            for faster checkout.
          </Text>

          <Message text="Sign in to manage delivery addresses." />
        </View>
      </Page>
    );
  }

  return (
    <Page title="">
      {loading ? (
        <Loading />
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View>
              {/* Header */}
              <View style={styles.pageIntro}>
                <View>
                  <Text style={styles.pageTitle}>
                    Where should we deliver?
                  </Text>

                  <Text style={styles.pageSubtitle}>
                    Add an address for quick and easy delivery.
                  </Text>
                </View>

                <View style={styles.locationIcon}>
                  <Ionicons
                    name="navigate-outline"
                    size={23}
                    color={palette.accent}
                  />
                </View>
              </View>

              {/* Saved addresses */}
              {addresses.length > 0 ? (
                <View style={styles.savedSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>
                      Saved addresses
                    </Text>

                    <View style={styles.countBadge}>
                      <Text style={styles.countText}>
                        {addresses.length}
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}

              {/* Add address form */}
              <View style={styles.formCard}>
                <View style={styles.formHeader}>
                  <View style={styles.formHeaderIcon}>
                    <Ionicons
                      name="add"
                      size={20}
                      color={palette.accent}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.formTitle}>
                      Add a new address
                    </Text>

                    <Text style={styles.formSubtitle}>
                      Enter your delivery details
                    </Text>
                  </View>
                </View>

                {/* Address type */}
                <Text style={styles.fieldLabel}>
                  Address type
                </Text>

                <View style={styles.typeRow}>
                  {ADDRESS_TYPES.map((item) => {
                    const selected = label === item.label;

                    return (
                      <Pressable
                        key={item.label}
                        onPress={() => setLabel(item.label)}
                        style={[
                          styles.typeChip,
                          selected && styles.typeChipSelected,
                        ]}
                      >
                        <Ionicons
                          name={item.icon}
                          size={17}
                          color={
                            selected
                              ? palette.accent
                              : palette.muted
                          }
                        />

                        <Text
                          style={[
                            styles.typeText,
                            selected && styles.typeTextSelected,
                          ]}
                        >
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Address */}
                <Text style={styles.fieldLabel}>
                  Address details
                </Text>

                <Input
                  value={line1}
                  onChangeText={setLine1}
                  placeholder="House / flat / building"
                  icon="business-outline"
                />

                <Input
                  value={street}
                  onChangeText={setStreet}
                  placeholder="Street / area / landmark"
                  icon="map-outline"
                />

                {/* City + Pincode */}
                <View style={styles.inputRow}>
                  <View style={{ flex: 1 }}>
                    <Input
                      value={city}
                      onChangeText={setCity}
                      placeholder="City"
                      icon="location-outline"
                    />
                  </View>

                  <View style={{ flex: 0.75 }}>
                    <Input
                      value={pincode}
                      onChangeText={setPincode}
                      keyboardType="number-pad"
                      placeholder="Pincode"
                      icon="pin-outline"
                    />
                  </View>
                </View>

                <Input
                  value={state}
                  onChangeText={setState}
                  placeholder="State"
                  icon="map-outline"
                />

                <Text style={styles.fieldLabel}>
                  Delivery instructions
                  <Text style={styles.optional}> · Optional</Text>
                </Text>

                <TextInput
                  value={instructions}
                  onChangeText={setInstructions}
                  multiline
                  numberOfLines={3}
                  placeholder="e.g. Call when you arrive..."
                  placeholderTextColor={palette.muted}
                  style={styles.textArea}
                />

                {!!error && (
                  <View style={styles.errorBox}>
                    <Ionicons
                      name="alert-circle-outline"
                      size={17}
                      color={lightTheme.errorColor}
                    />

                    <Text style={styles.errorText}>
                      {error}
                    </Text>
                  </View>
                )}

                <Pressable
                  disabled={busy || !isFormValid}
                  onPress={() => void save()}
                  style={[
                    styles.saveButton,
                    (!isFormValid || busy) &&
                      styles.saveButtonDisabled,
                  ]}
                >
                  {busy ? (
                    <ActivityIndicator color="#1a1412" />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={19}
                        color="#1a1412"
                      />

                      <Text style={styles.saveButtonText}>
                        Save address
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>

              {addresses.length > 0 ? (
                <Text style={styles.addressesLabel}>
                  Your saved locations
                </Text>
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <AddressCard
              address={item}
              busy={busy}
              onSetDefault={() =>
                void mutate(() =>
                  api.setDefaultAddress(item.id)
                )
              }
              onDelete={() =>
                void mutate(() =>
                  api.deleteAddress(item.id)
                )
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.noAddresses}>
              <View style={styles.noAddressIcon}>
                <Ionicons
                  name="location-outline"
                  size={30}
                  color={palette.muted}
                />
              </View>

              <Text style={styles.noAddressTitle}>
                No saved addresses
              </Text>

              <Text style={styles.noAddressText}>
                Add your first delivery address above.
              </Text>
            </View>
          }
        />
      )}
    </Page>
  );
}

/* -------------------------------------------------------------------------- */
/* Input                                                                       */
/* -------------------------------------------------------------------------- */

function Input({
  value,
  onChangeText,
  placeholder,
  icon,
  keyboardType,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  icon: keyof typeof Ionicons.glyphMap;
  keyboardType?: "default" | "number-pad";
}) {
  return (
    <View style={styles.inputWrapper}>
      <Ionicons
        name={icon}
        size={17}
        color={palette.muted}
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        placeholder={placeholder}
        placeholderTextColor={palette.muted}
        style={styles.input}
      />
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Address Card                                                                */
/* -------------------------------------------------------------------------- */

function AddressCard({
  address,
  busy,
  onSetDefault,
  onDelete,
}: {
  address: Address;
  busy: boolean;
  onSetDefault: () => void;
  onDelete: () => void;
}) {
  const icon =
    address.label === "Home"
      ? "home-outline"
      : address.label === "Work"
        ? "briefcase-outline"
        : "location-outline";

  return (
    <View
      style={[
        styles.addressCard,
        address.is_default && styles.defaultCard,
      ]}
    >
      <View style={styles.addressTop}>
        <View
          style={[
            styles.addressIcon,
            address.is_default &&
              styles.addressIconDefault,
          ]}
        >
          <Ionicons
            name={icon}
            size={21}
            color={
              address.is_default
                ? palette.accent
                : palette.muted
            }
          />
        </View>

        <View style={styles.addressMain}>
          <View style={styles.addressTitleRow}>
            <Text style={styles.addressTitle}>
              {address.label}
            </Text>

            {address.is_default ? (
              <View style={styles.defaultBadge}>
                <Ionicons
                  name="checkmark"
                  size={11}
                  color="#1a1412"
                />

                <Text style={styles.defaultBadgeText}>
                  DEFAULT
                </Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.addressLine}>
            {address.line1}
            {address.street
              ? `, ${address.street}`
              : ""}
          </Text>

          <Text style={styles.addressCity}>
            {address.city}, {address.state}{" "}
            {address.pincode}
          </Text>

          {address.instructions ? (
            <View style={styles.instructionRow}>
              <Ionicons
                name="information-circle-outline"
                size={13}
                color={palette.muted}
              />

              <Text style={styles.instructionText}>
                {address.instructions}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.addressActions}>
        {!address.is_default ? (
          <Pressable
            disabled={busy}
            onPress={onSetDefault}
            style={styles.defaultButton}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={16}
              color={palette.accent}
            />

            <Text style={styles.defaultButtonText}>
              Set as default
            </Text>
          </Pressable>
        ) : (
          <View style={styles.selectedText}>
            <Ionicons
              name="checkmark-circle"
              size={16}
              color="#228B22"
            />

            <Text style={styles.selectedTextLabel}>
              Primary delivery address
            </Text>
          </View>
        )}

        <Pressable
          disabled={busy}
          onPress={onDelete}
          style={styles.deleteButton}
        >
          <Ionicons
            name="trash-outline"
            size={16}
            color={lightTheme.errorColor}
          />

          <Text style={styles.deleteText}>
            Delete
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Styles                                                                      */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 35,
  },

  pageIntro: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },

  pageTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "900",
  },

  pageSubtitle: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 4,
  },

  locationIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FFD70018",
    borderWidth: 1,
    borderColor: "#FFD70035",
    alignItems: "center",
    justifyContent: "center",
  },

  savedSection: {
    marginBottom: 8,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  sectionTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900",
  },

  countBadge: {
    minWidth: 23,
    height: 23,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: palette.accent,
    alignItems: "center",
    justifyContent: "center",
  },

  countText: {
    color: "#1a1412",
    fontSize: 10,
    fontWeight: "900",
  },

  formCard: {
    backgroundColor: palette.bg,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 20,
    padding: 16,
    marginTop: 10,
  },

  formHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    marginBottom: 17,
  },

  formHeaderIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: "#FFD70018",
    alignItems: "center",
    justifyContent: "center",
  },

  formTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900",
  },

  formSubtitle: {
    color: palette.muted,
    fontSize: 11,
    marginTop: 2,
  },

  fieldLabel: {
    color: palette.text,
    fontSize: 11,
    fontWeight: "800",
    marginBottom: 7,
    marginTop: 4,
  },

  optional: {
    color: palette.muted,
    fontWeight: "500",
  },

  typeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },

  typeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: lightTheme.background,
  },

  typeChipSelected: {
    backgroundColor: "#FFD70018",
    borderColor: palette.accent,
  },

  typeText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
  },

  typeTextSelected: {
    color: palette.text,
    fontWeight: "900",
  },

  inputRow: {
    flexDirection: "row",
    gap: 9,
  },

  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    minHeight: 48,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: lightTheme.background,
    marginBottom: 9,
  },

  input: {
    flex: 1,
    color: palette.text,
    fontSize: 13,
    paddingVertical: 11,
  },

  textArea: {
    minHeight: 82,
    color: palette.text,
    backgroundColor: lightTheme.background,
    borderColor: palette.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    textAlignVertical: "top",
    marginBottom: 4,
  },

  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#DC143C12",
    borderWidth: 1,
    borderColor: "#DC143C35",
    borderRadius: 10,
    padding: 10,
    marginTop: 7,
  },

  errorText: {
    flex: 1,
    color: lightTheme.errorColor,
    fontSize: 11,
    lineHeight: 16,
  },

  saveButton: {
    minHeight: 51,
    borderRadius: 14,
    backgroundColor: palette.accent,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },

  saveButtonDisabled: {
    opacity: 0.5,
  },

  saveButtonText: {
    color: "#1a1412",
    fontSize: 13,
    fontWeight: "900",
  },

  addressesLabel: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 23,
    marginBottom: 9,
  },

  addressCard: {
    backgroundColor: lightTheme.cardBackground,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 17,
    padding: 14,
    marginBottom: 10,
  },

  defaultCard: {
    borderColor: "#FFD70070",
    backgroundColor: "#FFD70008",
  },

  addressTop: {
    flexDirection: "row",
    gap: 12,
  },

  addressIcon: {
    width: 43,
    height: 43,
    borderRadius: 13,
    backgroundColor: lightTheme.background,
    borderWidth: 1,
    borderColor: palette.border,
    alignItems: "center",
    justifyContent: "center",
  },

  addressIconDefault: {
    backgroundColor: "#FFD70018",
    borderColor: "#FFD70045",
  },

  addressMain: {
    flex: 1,
  },

  addressTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 5,
  },

  addressTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "900",
  },

  defaultBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: palette.accent,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },

  defaultBadgeText: {
    color: "#1a1412",
    fontSize: 8,
    fontWeight: "900",
  },

  addressLine: {
    color: palette.text,
    fontSize: 12,
    lineHeight: 18,
  },

  addressCity: {
    color: palette.muted,
    fontSize: 11,
    marginTop: 2,
  },

  instructionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 5,
    marginTop: 8,
  },

  instructionText: {
    flex: 1,
    color: palette.muted,
    fontSize: 10,
    lineHeight: 15,
  },

  addressActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: palette.border,
    marginTop: 13,
    paddingTop: 11,
  },

  defaultButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
  },

  defaultButtonText: {
    color: palette.accent,
    fontSize: 11,
    fontWeight: "800",
  },

  selectedText: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  selectedTextLabel: {
    color: "#228B22",
    fontSize: 10,
    fontWeight: "700",
  },

  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 5,
    paddingLeft: 10,
  },

  deleteText: {
    color: lightTheme.errorColor,
    fontSize: 11,
    fontWeight: "800",
  },

  noAddresses: {
    alignItems: "center",
    paddingVertical: 35,
  },

  noAddressIcon: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: lightTheme.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },

  noAddressTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "800",
  },

  noAddressText: {
    color: palette.muted,
    fontSize: 11,
    marginTop: 4,
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  emptyIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FFD70018",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },

  emptyText: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 18,
  },
});
